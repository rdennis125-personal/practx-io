<?php
/**
 * Plugin Name: Practx Payments
 * Description: Adds Practx payment methods with dealer workflows and orchestrator integration.
 * Version: 0.1.0
 * Author: Practx Engineering
 */

if (!defined('ABSPATH')) {
    exit;
}

define('PRACTX_PAYMENTS_VERSION', '0.1.0');
define('PRACTX_PAYMENTS_PATH', plugin_dir_path(__FILE__));
define('PRACTX_PAYMENTS_URL', plugin_dir_url(__FILE__));
require_once PRACTX_PAYMENTS_PATH . 'includes/class-practx-payments.php';

function practx_payments_run() {
    $plugin = new Practx_Payments_Plugin();
    $plugin->init();
}

practx_payments_run();
