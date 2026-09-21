export default {
  mentions: {
    deliveryFailed: 'Notification delivery was incomplete: {sent} sent, {failed} failed. Check the returned details.',
    hint: 'Choose Telegram users to mention for each event. Leave blank to send without mentions.',
    placeholder: "For example, {'@'}operator1 {'@'}operator2",
    events: {
      deposit_created: 'Order created', deposit_confirmed: 'Deposit confirmed', gas_low: 'Low gas balance', address_pool_low: 'Low address pool',
      sweep_success: 'Collection succeeded', sweep_failed: 'Collection failed', deposit_callback_failed: 'Merchant callback failed', test_notice: 'Test notification'
    }
  },
  collectionFlow: {
    selectEligible: 'Select all eligible addresses', select: 'Collect', selectAddress: 'Select address {address} for collection', selected: '{count} addresses selected',
    targetRequired: 'Enter the destination address for this collection', confirm: 'Collect from {count} wallets on {network} to {target}. Check the network, destination and selected wallets. Confirmation submits real on-chain transactions.'
  },
  gasFlow: {
    pickTitle: 'Choose gas recipients', pickHint: 'Filter by network and balance, select recipients, then enter the amount per address. Up to 1,000 addresses are shown per search.',
    selection: '{network}: {count} selected out of {total} matching addresses', useSelected: 'Create distribution for selected addresses',
    tronPrivateKey: 'TRC20 distribution uses private-key signing. The key is used for this operation and cleared from the page after submission.', privateKeyRequired: 'Enter the wallet private key for this transaction',
    confirm: 'Distribute gas to {count} addresses on {network}, paying {amount} {asset} in total. Confirmation submits real on-chain transactions.'
  },
  fundsFlow: { realTransfer: 'This operation moves real funds. Check the network, addresses and amounts before proceeding.', confirmTitle: 'Confirm on-chain fund operation' },
  'memberAddresses': {
    'title': 'Member address bindings',
    'description': 'A member reuses the same address for each network and asset. Switching to per-order allocation preserves existing bindings.',
    'empty': 'No member address bindings',
    'memberPlaceholder': 'Search member ID'
  },
  'runtime': {
    'title': 'Business settings',
    'intro': 'Manage collection addresses, merchant integration, order rules and chain scanning.',
    'integrationTab': 'Collection & integration',
    'runtimeTab': 'Orders & runtime',
    'addressTitle': 'Deposit address allocation',
    'addressHint': 'Choose how new orders obtain an address, including one address per member.',
    'addressMode': 'Default allocation mode',
    'modes': {
      'one_order': {
        'title': 'One address per order',
        'hint': 'Allocate an address from the pool for each new order.'
      },
      'member_reuse': {
        'title': 'One address per member',
        'hint': 'Bind an address to each member, network and asset, and reuse it for later orders.'
      },
      'app_reuse': {
        'title': 'One address per application',
        'hint': 'Bind an address to each application, network and asset, and reuse it for later orders.'
      }
    },
    'addressChangeHint': 'This default applies when the merchant does not specify an allocation mode. Member mode requires a member ID; application mode requires an application ID. Changing this default does not delete existing orders or bindings.',
    'viewBindings': 'View member address bindings',
    'orderTitle': 'Order rules',
    'orderHint': 'Set the default payment deadline. Underpayment rules are configured separately for each chain node.',
    'expiryHint': 'Used when an order does not specify its own deadline. Unpaid orders expire after this period.',
    'toleranceLabel': 'Legacy underpayment rate (read only)',
    'toleranceHint': 'The saved legacy value is {amount}%. It is not used for current deposit matching. Configure percentage or fixed-amount tolerance under Nodes.',
    'accessTitle': 'IP allowlists',
    'accessHint': 'Manage access to business administration and merchant order APIs separately. Leave empty to allow any source IP.',
    'whitelistPlaceholder': 'One IP or CIDR per line; commas and semicolons also work',
    'adminWhitelistHint': 'Restricts business management API access. Include your public IP before saving.',
    'orderWhitelistHint': 'Restricts merchant order creation and lookup. Enter merchant server public IPs.',
    'scanTitle': 'Scan frequency & lookback',
    'scanHint': 'Set the automatic deposit checking interval and the initial BSC scan range.',
    'scanIntervalHint': 'Seconds between automatic scan rounds. Shorter intervals increase RPC usage.',
    'lookbackHint': 'Blocks to scan during the initial BSC catch-up. Configure other networks under Nodes.',
    'tronTitle': 'TRON runtime',
    'tronHint': 'Parameters for TRON batch gas distribution and gRPC access.',
    'contractHint': 'The active TRON batch distribution contract address, starting with T.',
    'grpcHint': 'Use host:port, such as grpc.trongrid.io:50051, without https://.',
    'unsaved': 'You have unsaved changes',
    'savedState': 'Settings are synchronized with the server',
    'positiveNumber': 'Enter an integer greater than zero',
    'invalidTolerance': 'Enter a percentage from 0 up to, but not including, 100',
    'discard': 'Discard changes',
    'discardConfirm': 'Discard unsaved changes and reload the server settings?',
    'saveSuccess': 'Settings saved and applied'
  },
  'systemConfig': {
    'save': 'Save collection & integration settings',
    'secretSaved': 'Saved; leave blank to keep',
    'secretEmpty': 'Enter secret',
    'missing': 'The server is missing configuration entries. Check initialization: {keys}',
    'groups': {
      'merchant': {
        'title': 'Merchant API & signatures',
        'hint': 'Configure merchant identity and HMAC verification for order creation.'
      },
      'callback': {
        'title': 'Deposit callbacks & retries',
        'hint': 'Configure callback signatures, queue processing and retry behavior.'
      },
      'chain': {
        'title': 'Chain services & concurrency',
        'hint': 'Configure scanning resources and chain provider credentials. Main RPC, token and confirmation settings are under Nodes.'
      },
      'management': {
        'title': 'Management & authenticator labels',
        'hint': 'Manage API compatibility, SQL logging and the labels used for new authenticator bindings.'
      }
    },
    'fields': {
      'MERCHANT_API_SIGNATURE_ENABLED': {
        'label': 'Verify merchant HMAC signatures',
        'hint': 'Require a valid merchant key, timestamp and signature on merchant requests.'
      },
      'MERCHANT_API_KEY': {
        'label': 'Merchant API key',
        'hint': 'Matches the X-Merchant-Key header sent by the merchant.'
      },
      'MERCHANT_API_SECRET': {
        'label': 'Merchant HMAC secret',
        'hint': 'Used by the merchant to sign requests. Leave blank to keep the saved secret.'
      },
      'MERCHANT_API_SIGNATURE_MAX_SKEW_SECONDS': {
        'label': 'Allowed signature clock skew (seconds)',
        'hint': 'Reject signatures outside this timestamp window.'
      },
      'CALLBACK_SIGNATURE_ENABLED': {
        'label': 'Sign callbacks with HMAC',
        'hint': 'Add a signature so the receiver can verify the callback source.'
      },
      'CALLBACK_SIGNING_SECRET': {
        'label': 'Callback signing secret',
        'hint': 'The HMAC secret shared with the callback receiver.'
      },
      'CALLBACK_TIMEZONE': {
        'label': 'Callback timezone',
        'hint': 'Timezone for callback timestamp fields, such as Asia/Shanghai.'
      },
      'CALLBACK_HTTP_TIMEOUT_SECONDS': {
        'label': 'Callback HTTP timeout (seconds)',
        'hint': 'Maximum time to wait for a response to a single callback.'
      },
      'CALLBACK_WORKER_INTERVAL_SECONDS': {
        'label': 'Callback queue interval (seconds)',
        'hint': 'How often the worker checks for pending callback tasks.'
      },
      'CALLBACK_WORKER_BATCH_SIZE': {
        'label': 'Callback batch size',
        'hint': 'Maximum number of callback tasks processed per round.'
      },
      'CALLBACK_MAX_ATTEMPTS': {
        'label': 'Maximum callback attempts',
        'hint': 'Stop automatic attempts after this many failed deliveries.'
      },
      'CALLBACK_RETRY_BASE_SECONDS': {
        'label': 'Initial retry delay (seconds)',
        'hint': 'Starting delay for callback retry backoff.'
      },
      'CALLBACK_RETRY_MAX_SECONDS': {
        'label': 'Maximum retry delay (seconds)',
        'hint': 'Upper limit for callback retry backoff.'
      },
      'WORKER_SCAN_CHUNK_CONCURRENCY': {
        'label': 'Scan chunk concurrency',
        'hint': 'Number of scan chunks processed at once. Consider your RPC quota.'
      },
      'BSC_FALLBACK_RPC_URL': {
        'label': 'Preferred BSC RPC URL',
        'hint': 'When set, scanning, balance refreshes, collection and gas distribution prefer this URL.'
      },
      'GETBLOCK_ACCESS_TOKEN': {
        'label': 'GetBlock token',
        'hint': 'Used for GetBlock access when no preferred BSC RPC URL is set.'
      },
      'TRON_SCAN_ADDRESS_LIMIT': {
        'label': 'TRON addresses per scan round',
        'hint': 'Caps the number of addresses checked per round to control provider usage.'
      },
      'TRON_SCAN_CONCURRENCY': {
        'label': 'TRON scan concurrency',
        'hint': 'Number of TRON addresses queried at once.'
      },
      'TRONGRID_API_BASE': {
        'label': 'TronGrid API base URL',
        'hint': 'For example, https://api.trongrid.io/v1.'
      },
      'TRONGRID_API_KEY': {
        'label': 'TronGrid API key',
        'hint': 'Credential for TronGrid. Leave blank to keep the saved secret.'
      },
      'TRONSCAN_API_BASE': {
        'label': 'TronScan API base URL',
        'hint': 'For example, https://apilist.tronscanapi.com.'
      },
      'TRONSCAN_API_KEY': {
        'label': 'TronScan API key',
        'hint': 'Credential for TronScan. Leave blank to keep the saved secret.'
      },
      'TOTP_ISSUER': {
        'label': 'Authenticator issuer',
        'hint': 'Service name displayed in Google Authenticator for new bindings.'
      },
      'TOTP_ACCOUNT': {
        'label': 'Default authenticator account label',
        'hint': 'Default label for compatibility accounts. Existing bindings are unchanged.'
      },
      'ADMIN_API_KEY': {
        'label': 'Legacy management API key',
        'hint': 'Retained from the legacy system only. New management APIs require a login token and role permissions; this value cannot be edited.'
      },
      'SQL_LOG_ENABLED': {
        'label': 'Enable SQL logs',
        'hint': 'Log database statements and non-sensitive parameters for troubleshooting.'
      }
    }
  },
  'security': {
    'title': 'Account security',
    'intro': 'Manage this account’s Google Authenticator binding for login and protected fund operations.',
    'authenticator': 'Google Authenticator',
    'bound': 'Bound',
    'unbound': 'Not bound',
    'boundHint': 'Verification is enabled. Login and protected fund operations use this binding.',
    'unboundHint': 'This account has no authenticator binding. Scan and verify below.',
    'currentAccount': 'Current account',
    'legacyHint': 'This account uses its original authenticator binding. You do not need to scan a new code.',
    'bindTitle': 'Bind Google Authenticator',
    'bindHint': 'The binding takes effect only after you confirm a valid 6-digit code.',
    'startHint': 'Open Google Authenticator on your phone, then generate a binding QR code below.',
    'start': 'Start binding',
    'stepScan': '1. Scan the QR code',
    'stepVerify': '2. Enter the code',
    'qrAlt': 'Google Authenticator binding QR code',
    'manualKey': 'If scanning is unavailable, enter this key manually in the authenticator',
    'codeHint': 'Enter the current 6-digit code shown on your phone.',
    'codePlaceholder': 'Enter the 6-digit code',
    'bind': 'Verify and bind',
    'invalidCode': 'Enter a 6-digit numeric code',
    'replaceTitle': 'Replace or remove binding',
    'replaceHint': 'To change devices, first remove the binding using the current code, then bind the new device. Protected fund operations require a new binding after removal.',
    'currentCode': 'Current authenticator code',
    'unbindConfirm': 'Remove this account’s Google Authenticator binding? Bind it again to continue using fund operations that require secondary verification.',
    'bindSuccess': 'Google Authenticator is now bound',
    'unbindSuccess': 'Google Authenticator binding removed'
  },
  welcome: 'Manage wallets, deposit orders and on-chain fund operations.',
  'title': {
    'wallets': 'Wallets',
    'deposits': 'Deposits',
    'nodes': 'Nodes',
    'transactions': 'Transactions',
    'gas': 'Gas',
    'collection': 'Collection',
    'settings': 'Settings',
    'notifications': 'Notifications',
    'security': 'Security'
  },
  'operations': {
    'diagnoseNotifications': 'Diagnose notification delivery',
    'callbackJobs': 'View merchant callback queue',
    'generate': 'Generate',
    'importWallets': 'Import Wallets',
    'refreshBalances': 'Refresh Balances',
    'exportWallets': 'Export Wallets',
    'deleteWallets': 'Delete Wallets',
    'createDeposit': 'Create Deposit',
    'verifyDeposit': 'Verify Deposit',
    'retryCallback': 'Retry Callback',
    'scan': 'Scan',
    'saveNode': 'Save Node',
    'testNode': 'Test Node',
    'confirmTransactions': 'Confirm Transactions',
    'retryTransactions': 'Retry Transactions',
    'gasCandidates': 'Gas Candidates',
    'createGas': 'Create Gas',
    'gasDetail': 'Gas Detail',
    'executeGas': 'Execute Gas',
    'recordGas': 'Record Gas',
    'saveCollection': 'Save Collection',
    'runCollection': 'Run Collection',
    'saveRuntime': 'Save Runtime',
    'resetRuntime': 'Reset Runtime',
    'saveNotifications': 'Save Notifications',
    'listBindings': 'List Bindings',
    'saveBinding': 'Save Binding',
    'deleteBinding': 'Delete Binding',
    'testNotifications': 'Test Notifications',
    'setupTotp': 'Setup Totp',
    'bindTotp': 'Bind Totp',
    'unbindTotp': 'Unbind Totp'
  },
  'fields': {
    'deposit_id': 'Deposit ID',
    'attempts': 'Attempts',
    'max_attempts': 'Maximum attempts',
    'next_attempt_at': 'Next retry time',
    'last_error': 'Last error',
    'jobs': 'Callback jobs',
    'max_gas_balance': 'Maximum gas balance',
    'assignment_mode': 'Address allocation mode',
    'bound_member_id': 'Bound member ID',
    'bound_app_id': 'Bound application ID',
    'app_id': 'Application ID',
    'payer_address': 'Payer address',
    'callback_attempts': 'Callback attempts',
    'underpay_tolerance_mode': 'Underpayment tolerance mode',
    'underpay_tolerance_rate': 'Underpayment ratio (0.002 means 0.2%)',
    'underpay_tolerance_amount': 'Fixed underpayment amount',
    'telegram_mentions': 'Notification mentions',
    'can_collect': 'Can collect',
    'reason': 'Reason',
    'network': 'Network',
    'chain_type': 'Chain type',
    'name': 'Name',
    'rpc_url': 'Rpc url',
    'local_test_mode': 'Local test mode',
    'proxy_url': 'Proxy url',
    'chain_id': 'Chain id',
    'token_contract': 'Token contract',
    'token_decimals': 'Token decimals',
    'min_confirmations': 'Min confirmations',
    'scan_lookback_blocks': 'Scan lookback blocks',
    'gas_asset': 'Gas asset',
    'gas_price_gwei': 'Gas price gwei',
    'token_gas_limit': 'Token gas limit',
    'native_gas_limit': 'Native gas limit',
    'explorer_tx_url': 'Explorer tx url',
    'enabled': 'Enabled',
    'hot_private_key_saved': 'Hot private key saved',
    'admin_ui_whitelist_ips': 'Admin ui whitelist ips',
    'order_whitelist_ips': 'Order whitelist ips',
    'default_deposit_expire_minutes': 'Default deposit expire minutes',
    'deposit_underpay_tolerance_rate': 'Deposit underpay tolerance rate',
    'worker_scan_interval_seconds': 'Worker scan interval seconds',
    'bsc_scan_lookback_blocks': 'Bsc scan lookback blocks',
    'trc_batch_gas_contract_address': 'Trc batch gas contract address',
    'tron_grpc_endpoint': 'Tron grpc endpoint',
    'asset': 'Asset',
    'auto_collect_enabled': 'Auto collect enabled',
    'auto_collect_time': 'Auto collect time',
    'amount_threshold': 'Amount threshold',
    'settlement_wallet': 'Settlement wallet',
    'gas_min_balance': 'Gas min balance',
    'collect_token_enabled': 'Collect token enabled',
    'collect_native_enabled': 'Collect native enabled',
    'telegram_enabled': 'Telegram enabled',
    'telegram_proxy_enabled': 'Telegram proxy enabled',
    'telegram_proxy_url': 'Telegram proxy url',
    'telegram_ca_file': 'Telegram ca file',
    'telegram_skip_tls_verify': 'Telegram skip tls verify',
    'notify_deposit_created': 'Notify deposit created',
    'notify_deposit_confirmed': 'Notify deposit confirmed',
    'deposit_min_amount': 'Deposit min amount',
    'notify_gas_low': 'Notify gas low',
    'gas_low_threshold': 'Gas low threshold',
    'notify_address_pool_low': 'Notify address pool low',
    'notify_sweep_success': 'Notify sweep success',
    'notify_sweep_failed': 'Notify sweep failed',
    'address': 'Address',
    'status': 'Status',
    'id': 'Id',
    'tx_hash': 'Tx hash',
    'merchant_order_id': 'Merchant order id',
    'member_id': 'Member id',
    'callback_url': 'Callback url',
    'amount': 'Amount',
    'amount_per_wallet': 'Amount per wallet',
    'note': 'Note',
    'secret': 'Secret',
    'code': 'Code',
    'verify_code': 'Verify code',
    'chat_id': 'Chat id',
    'bot_token': 'Bot token',
    'wallet_method': 'Wallet method',
    'private_key': 'Private key',
    'addresses': 'Addresses',
    'private_ref': 'Private ref',
    'min_token_balance': 'Min token balance',
    'min_gas_balance': 'Min gas balance',
    'wallet_status': 'Wallet status',
    'count': 'Count',
    'expire_minutes': 'Expire minutes',
    'force': 'Force',
    'token_balance': 'Token balance',
    'gas_balance': 'Gas balance',
    'created_at': 'Created at',
    'callback_status': 'Callback status',
    'kind': 'Kind',
    'to_address': 'To address',
    'recipient_count': 'Recipient count',
    'total_amount': 'Total amount',
    'payable_total_amount': 'Payable total amount',
    'event_type': 'Event type',
    'target': 'Target',
    'totp_enabled': 'Totp enabled',
    'totp_secret_saved': 'Totp secret saved',
    'totp_bound_at': 'Totp bound at'
  },
  'options': {
    'plugin': 'Browser wallet signing',
    'private_key': 'Private-key signing',
    'one_order': 'One address per order',
    'member_reuse': 'One address per member',
    'app_reuse': 'One address per application',
    'rate': 'Percentage',
    'fixed': 'Fixed amount'
  },
  'submit': 'Confirm',
  'cancel': 'Cancel',
  'result': 'Result',
  'confirm': 'Review the parameters before confirming.',
  'selectFirst': 'Select records first',
  'success': 'Completed',
  'loadFailed': 'Loading failed. Retry.',
  'refresh': 'Refresh',
  'noWallet': 'Install and unlock a wallet extension first',
  'submitted': 'Transaction broadcast. Keep the hash and do not resend.',
  'detail': 'Details'
}
