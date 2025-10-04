<?php

class Practx_Gateway_Secure extends Practx_Gateway_Base {
    public function __construct() {
        parent::__construct('practx_secure', 'Practx Secure Pay', 'Secure pay with Practx-managed settlement hold.');
    }
}
