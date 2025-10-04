<?php

class Practx_Payments_Plugin {
    public function init() {
        add_action('plugins_loaded', array($this, 'bootstrap'));
    }

    public function bootstrap() {
        if (!class_exists('WC_Payment_Gateway')) {
            return;
        }

        $this->register_hooks();
        $this->load_dependencies();
    }

    private function load_dependencies() {
        require_once PRACTX_PAYMENTS_PATH . 'includes/gateways/class-practx-gateway-base.php';
        require_once PRACTX_PAYMENTS_PATH . 'includes/gateways/class-practx-gateway-pay-now.php';
        require_once PRACTX_PAYMENTS_PATH . 'includes/gateways/class-practx-gateway-dealer.php';
        require_once PRACTX_PAYMENTS_PATH . 'includes/gateways/class-practx-gateway-secure.php';
    }

    private function register_hooks() {
        add_filter('woocommerce_payment_gateways', array($this, 'register_gateways'));
        add_action('init', array($this, 'register_statuses'));
        add_filter('wc_order_statuses', array($this, 'inject_custom_statuses'));
        add_filter('woocommerce_checkout_fields', array($this, 'append_dealer_fields'));
        add_action('woocommerce_checkout_process', array($this, 'validate_dealer_fields'));
        add_action('woocommerce_checkout_create_order', array($this, 'save_dealer_meta'), 10, 2);
        add_action('woocommerce_new_order', array($this, 'handle_new_order'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('admin_menu', array($this, 'register_admin_pages'));
    }

    public function register_gateways($gateways) {
        $gateways[] = 'Practx_Gateway_Pay_Now';
        $gateways[] = 'Practx_Gateway_Dealer';
        $gateways[] = 'Practx_Gateway_Secure';
        return $gateways;
    }

    public function register_statuses() {
        register_post_status('wc-completion-pending', array(
            'label' => 'Completion pending',
            'public' => true,
            'exclude_from_search' => false,
            'show_in_admin_all_list' => true,
            'show_in_admin_status_list' => true,
            'label_count' => _n_noop('Completion pending (%s)', 'Completion pending (%s)')
        ));

        register_post_status('wc-acknowledged', array(
            'label' => 'Acknowledged',
            'public' => true,
            'exclude_from_search' => false,
            'show_in_admin_all_list' => true,
            'show_in_admin_status_list' => true,
            'label_count' => _n_noop('Acknowledged (%s)', 'Acknowledged (%s)')
        ));

        register_post_status('wc-disputed', array(
            'label' => 'Disputed',
            'public' => true,
            'exclude_from_search' => false,
            'show_in_admin_all_list' => true,
            'show_in_admin_status_list' => true,
            'label_count' => _n_noop('Disputed (%s)', 'Disputed (%s)')
        ));
    }

    public function inject_custom_statuses($statuses) {
        $custom = array(
            'wc-completion-pending' => 'Completion pending',
            'wc-acknowledged' => 'Acknowledged',
            'wc-disputed' => 'Disputed'
        );

        return array_merge($statuses, $custom);
    }

    public function append_dealer_fields($fields) {
        $fields['billing']['practx_dealer_name'] = array(
            'label' => 'Dealer name',
            'required' => false,
            'class' => array('form-row-wide')
        );
        $fields['billing']['practx_ap_contact_email'] = array(
            'label' => 'Accounts payable email',
            'required' => false,
            'class' => array('form-row-wide'),
            'validate' => array('email')
        );
        $fields['billing']['practx_dealer_authorize'] = array(
            'type' => 'checkbox',
            'label' => 'I authorize Practx to request a dealer purchase order on my behalf.',
            'required' => true
        );
        return $fields;
    }

    public function validate_dealer_fields() {
        $payment_method = isset($_POST['payment_method']) ? sanitize_text_field(wp_unslash($_POST['payment_method'])) : '';
        if ($payment_method !== 'practx_dealer') {
            return;
        }

        if (empty($_POST['practx_dealer_authorize'])) {
            wc_add_notice(__('Please authorize the dealer purchase order request.'), 'error');
        }
    }

    public function save_dealer_meta($order, $data) {
        $method = $order->get_payment_method();
        if ($method !== 'practx_dealer') {
            return;
        }

        $dealer_name = isset($_POST['practx_dealer_name']) ? sanitize_text_field(wp_unslash($_POST['practx_dealer_name'])) : '';
        $ap_email = isset($_POST['practx_ap_contact_email']) ? sanitize_email(wp_unslash($_POST['practx_ap_contact_email'])) : '';
        $authorize = isset($_POST['practx_dealer_authorize']) ? (bool) $_POST['practx_dealer_authorize'] : false;

        $order->update_meta_data('_practx_dealer_name', $dealer_name);
        $order->update_meta_data('_practx_ap_contact_email', $ap_email);
        $order->update_meta_data('_practx_dealer_authorize', $authorize ? 'yes' : 'no');
    }

    private function get_orchestrator_url() {
        $url = get_option('practx_orchestrator_url');
        if (empty($url)) {
            $url = 'http://localhost:7071/api';
        }
        return untrailingslashit($url);
    }

    private function get_webhook_secret() {
        $secret = get_option('practx_webhook_key');
        if (empty($secret)) {
            $secret = 'local_secret';
        }
        return $secret;
    }

    public function handle_new_order($order_id) {
        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }

        $method = $order->get_payment_method();
        if (!in_array($method, array('practx_dealer', 'practx_pay_now', 'practx_secure'), true)) {
            return;
        }

        if ($method === 'practx_dealer') {
            $order->update_status('wc-completion-pending', 'Awaiting dealer acknowledgement.', false);
        }

        $payload = $this->build_order_payload($order);
        $body = wp_json_encode($payload);
        $signature = hash_hmac('sha256', $body, $this->get_webhook_secret());

        $response = wp_remote_post($this->get_orchestrator_url() . '/orders/on-created', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-Signature' => $signature,
                'x-idempotency-key' => $order->get_order_key()
            ),
            'body' => $body,
            'timeout' => 10
        ));

        if (is_wp_error($response)) {
            $order->add_order_note('Practx orchestrator error: ' . $response->get_error_message());
            return;
        }

        $order->add_order_note('Practx orchestrator notified for settlement workflow.');
    }

    private function build_order_payload($order) {
        $items_total = $order->get_total();
        $payload = array(
            'order_id' => (string) $order->get_id(),
            'customer_id' => (string) $order->get_customer_id(),
            'amount_cents' => (int) round($items_total * 100),
            'currency' => $order->get_currency(),
            'payment_method' => $this->map_payment_method($order->get_payment_method()),
            'dealer_name' => $order->get_meta('_practx_dealer_name'),
            'ap_contact_email' => $order->get_meta('_practx_ap_contact_email'),
            'notes' => $order->get_customer_note()
        );
        return $payload;
    }

    private function map_payment_method($method) {
        switch ($method) {
            case 'practx_dealer':
                return 'DealerAccount';
            case 'practx_secure':
                return 'PractxSecurePay';
            default:
                return 'PayNow';
        }
    }

    public function register_rest_routes() {
        register_rest_route('practx/v1', '/acknowledge', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_acknowledge'),
            'permission_callback' => '__return_true'
        ));
    }

    public function handle_acknowledge($request) {
        $token = $request->get_param('token');
        if (empty($token)) {
            return new WP_Error('invalid_token', 'token is required', array('status' => 400));
        }

        $body = wp_json_encode(array('token' => $token, 'approved' => true, 'actor' => 'Customer self-service'));
        $signature = hash_hmac('sha256', $body, $this->get_webhook_secret());

        $response = wp_remote_post($this->get_orchestrator_url() . '/ack', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-Signature' => $signature
            ),
            'body' => $body,
            'timeout' => 10
        ));

        if (is_wp_error($response)) {
            return new WP_Error('orchestrator_error', $response->get_error_message(), array('status' => 500));
        }

        return rest_ensure_response(array('status' => 'ok'));
    }

    public function register_admin_pages() {
        add_menu_page('Practx Payments', 'Practx Payments', 'manage_woocommerce', 'practx-payments', array($this, 'render_matches_page'));
        add_submenu_page('practx-payments', 'Dealer Account Matches', 'Dealer Account Matches', 'manage_woocommerce', 'practx-payments', array($this, 'render_matches_page'));
        add_submenu_page('practx-payments', 'Dispute Queue', 'Dispute Queue', 'manage_woocommerce', 'practx-disputes', array($this, 'render_disputes_page'));
    }

    public function render_matches_page() {
        if (isset($_POST['practx_settings_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['practx_settings_nonce'])), 'practx_settings')) {
            update_option('practx_orchestrator_url', esc_url_raw(wp_unslash($_POST['practx_orchestrator_url'])));
            update_option('practx_webhook_key', sanitize_text_field(wp_unslash($_POST['practx_webhook_key'])));
            echo '<div class="updated"><p>Settings saved.</p></div>';
        }

        $orchestrator_url = esc_url(get_option('practx_orchestrator_url', 'http://localhost:7071/api'));
        $webhook_key = esc_attr(get_option('practx_webhook_key', 'local_secret'));
        ?>
        <div class="wrap">
            <h1>Dealer Account Matches</h1>
            <p>Use this dashboard to reconcile dealer purchase order matches during the pilot.</p>
            <form method="post">
                <?php wp_nonce_field('practx_settings', 'practx_settings_nonce'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="practx_orchestrator_url">Orchestrator URL</label></th>
                        <td><input type="text" class="regular-text" name="practx_orchestrator_url" value="<?php echo $orchestrator_url; ?>" /></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="practx_webhook_key">Webhook secret</label></th>
                        <td><input type="text" class="regular-text" name="practx_webhook_key" value="<?php echo $webhook_key; ?>" /></td>
                    </tr>
                </table>
                <p><button type="submit" class="button button-primary">Save settings</button></p>
            </form>
            <h2>Recent dealer verifications</h2>
            <p>Orders awaiting acknowledgement will appear after orchestrator callbacks.</p>
        </div>
        <?php
    }

    public function render_disputes_page() {
        ?>
        <div class="wrap">
            <h1>Dispute Queue</h1>
            <p>Track orders escalated as disputes. Future enhancements will allow inline resolution.</p>
        </div>
        <?php
    }
}
