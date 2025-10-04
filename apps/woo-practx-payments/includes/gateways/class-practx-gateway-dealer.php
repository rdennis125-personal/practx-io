<?php

class Practx_Gateway_Dealer extends Practx_Gateway_Base {
    public function __construct() {
        parent::__construct('practx_dealer', 'Bill my dealer account', 'Route payment to dealer for purchase order verification.');
    }

    public function process_payment($order_id) {
        $order = wc_get_order($order_id);
        if (!$order) {
            return array('result' => 'failure');
        }

        $order->update_status('wc-completion-pending', 'Awaiting dealer acknowledgement.', false);
        WC()->cart->empty_cart();

        return array(
            'result' => 'success',
            'redirect' => $this->get_return_url($order)
        );
    }
}
