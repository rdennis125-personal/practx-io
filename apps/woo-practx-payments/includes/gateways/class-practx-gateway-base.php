<?php

abstract class Practx_Gateway_Base extends WC_Payment_Gateway {
    public function __construct($id, $title, $description) {
        $this->id = $id;
        $this->method_title = $title;
        $this->method_description = $description;
        $this->has_fields = false;
        $this->supports = array('products');

        $this->init_form_fields();
        $this->init_settings();

        add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
    }

    public function init_form_fields() {
        $this->form_fields = array(
            'enabled' => array(
                'title' => 'Enable/Disable',
                'type' => 'checkbox',
                'label' => 'Enable this payment method',
                'default' => 'yes'
            ),
            'title' => array(
                'title' => 'Title',
                'type' => 'text',
                'default' => $this->method_title,
                'desc_tip' => true,
                'description' => 'Controls the payment method title seen during checkout.'
            ),
            'description' => array(
                'title' => 'Description',
                'type' => 'textarea',
                'default' => $this->method_description,
                'description' => 'Checkout description shown to customers.'
            )
        );
    }

    public function process_payment($order_id) {
        $order = wc_get_order($order_id);
        if (!$order) {
            return array('result' => 'failure');
        }

        $order->payment_complete();
        WC()->cart->empty_cart();

        return array(
            'result' => 'success',
            'redirect' => $this->get_return_url($order)
        );
    }
}
