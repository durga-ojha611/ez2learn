<?php
require_once __DIR__ . '/../config/database.php';
$db = Database::getConnection();

$defaults = [
    'school_legal_name' => 'EZY 2 LEARN Driving School Pty Ltd',
    'abn' => '84 928 319 402',
    'acn' => '928 319 402',
    'gst_registered' => '1',
    'gst_percentage' => '10',
    'tax_invoice_prefix' => 'TAX-INV-',
    'tax_inclusive' => '1',
    'currency' => 'AUD',
    'logo_url' => '/logo.png',
    
    // Normal / Physical Address (Australia)
    'normal_address_street' => 'Suite 4, 32-36 Church Street',
    'normal_address_suburb' => 'Parramatta',
    'normal_address_state' => 'NSW',
    'normal_address_postcode' => '2150',
    'normal_address_country' => 'Australia',

    // Billing Address
    'billing_same_as_normal' => '1',
    'billing_address_street' => 'Suite 4, 32-36 Church Street',
    'billing_address_suburb' => 'Parramatta',
    'billing_address_state' => 'NSW',
    'billing_address_postcode' => '2150',
    'billing_address_country' => 'Australia',

    // Australian Banking / Direct Deposit Details
    'bank_name' => 'Commonwealth Bank of Australia',
    'bank_account_name' => 'EZY 2 LEARN DRIVING SCHOOL PTY LTD',
    'bank_bsb' => '062-000',
    'bank_account_number' => '1092 8491',
    'payid_identifier' => 'admin@ezy2learn.com.au',
    'invoice_payment_terms' => 'Payment due within 7 days of invoice date. BSB: 062-000 | Account: 1092 8491 | Quote Tax Invoice number as payment description.',

    // API Integrations
    'stripe_enabled' => '1',
    'stripe_mode' => 'test',
    'stripe_publishable_key' => 'pk_test_51MzEzy2LearnSydneyDriving001SecKey',
    'stripe_secret_key' => 'sk_test_51MzEzy2LearnSydneySecretKeyHidden0099',
    'stripe_webhook_secret' => 'whsec_920fbc89a71b2d49e1e2',
    'xero_enabled' => '0',
    'xero_client_id' => '',
    'xero_client_secret' => '',
    'square_enabled' => '0',
    'square_application_id' => '',
    'square_access_token' => '',
];

$stmt = $db->prepare("
    INSERT INTO website_settings (setting_key, setting_value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE setting_value = IF(setting_value IS NULL OR setting_value = '', VALUES(setting_value), setting_value)
");

foreach ($defaults as $k => $v) {
    $stmt->execute([$k, $v]);
}

echo "Australian settings verified/seeded successfully." . PHP_EOL;

// Fetch all keys
$rows = $db->query("SELECT setting_key, setting_value FROM website_settings ORDER BY setting_key ASC")->fetchAll();
foreach ($rows as $r) {
    echo $r['setting_key'] . " = " . $r['setting_value'] . PHP_EOL;
}
