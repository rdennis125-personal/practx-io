<?php

class Practx_Gateway_Pay_Now extends Practx_Gateway_Base {
    public function __construct() {
        parent::__construct('practx_pay_now', 'Practx Pay Now', 'Collect payment immediately using standard WooCommerce flow.');
    }
}
