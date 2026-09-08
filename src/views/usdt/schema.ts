export interface Field { key: string; type: string; options?: string[] }
export interface Operation { key: string; url: string; method: string; fields: string[]; row?: boolean; read?: boolean; load?: string; selection?: string; download?: boolean; defaults?: Record<string, unknown> }
export interface Resource { name: string; url: string; list?: string; paged?: boolean; columns: string[]; query: string[]; operations: Operation[] }
export const fields: Record<string, Field> = {
  'network': {
    'key': 'network',
    'type': 'select',
    'options': [
      'BEP20',
      'TRC20'
    ]
  },
  'chain_type': {
    'key': 'chain_type',
    'type': 'text'
  },
  'name': {
    'key': 'name',
    'type': 'text'
  },
  'rpc_url': {
    'key': 'rpc_url',
    'type': 'text'
  },
  'local_test_mode': {
    'key': 'local_test_mode',
    'type': 'boolean'
  },
  'proxy_url': {
    'key': 'proxy_url',
    'type': 'text'
  },
  'chain_id': {
    'key': 'chain_id',
    'type': 'number'
  },
  'token_contract': {
    'key': 'token_contract',
    'type': 'text'
  },
  'token_decimals': {
    'key': 'token_decimals',
    'type': 'number'
  },
  'min_confirmations': {
    'key': 'min_confirmations',
    'type': 'number'
  },
  'scan_lookback_blocks': {
    'key': 'scan_lookback_blocks',
    'type': 'number'
  },
  'gas_asset': {
    'key': 'gas_asset',
    'type': 'text'
  },
  'gas_price_gwei': {
    'key': 'gas_price_gwei',
    'type': 'text'
  },
  'token_gas_limit': {
    'key': 'token_gas_limit',
    'type': 'number'
  },
  'native_gas_limit': {
    'key': 'native_gas_limit',
    'type': 'number'
  },
  'explorer_tx_url': {
    'key': 'explorer_tx_url',
    'type': 'text'
  },
  'enabled': {
    'key': 'enabled',
    'type': 'boolean'
  },
  'hot_private_key_saved': {
    'key': 'hot_private_key_saved',
    'type': 'boolean'
  },
  'admin_ui_whitelist_ips': {
    'key': 'admin_ui_whitelist_ips',
    'type': 'text'
  },
  'order_whitelist_ips': {
    'key': 'order_whitelist_ips',
    'type': 'text'
  },
  'default_deposit_expire_minutes': {
    'key': 'default_deposit_expire_minutes',
    'type': 'number'
  },
  'deposit_underpay_tolerance_rate': {
    'key': 'deposit_underpay_tolerance_rate',
    'type': 'text'
  },
  'worker_scan_interval_seconds': {
    'key': 'worker_scan_interval_seconds',
    'type': 'number'
  },
  'bsc_scan_lookback_blocks': {
    'key': 'bsc_scan_lookback_blocks',
    'type': 'number'
  },
  'trc_batch_gas_contract_address': {
    'key': 'trc_batch_gas_contract_address',
    'type': 'text'
  },
  'tron_grpc_endpoint': {
    'key': 'tron_grpc_endpoint',
    'type': 'text'
  },
  'asset': {
    'key': 'asset',
    'type': 'text'
  },
  'auto_collect_enabled': {
    'key': 'auto_collect_enabled',
    'type': 'boolean'
  },
  'auto_collect_time': {
    'key': 'auto_collect_time',
    'type': 'text'
  },
  'amount_threshold': {
    'key': 'amount_threshold',
    'type': 'text'
  },
  'settlement_wallet': {
    'key': 'settlement_wallet',
    'type': 'text'
  },
  'gas_min_balance': {
    'key': 'gas_min_balance',
    'type': 'text'
  },
  'collect_token_enabled': {
    'key': 'collect_token_enabled',
    'type': 'boolean'
  },
  'collect_native_enabled': {
    'key': 'collect_native_enabled',
    'type': 'boolean'
  },
  'telegram_enabled': {
    'key': 'telegram_enabled',
    'type': 'boolean'
  },
  'telegram_proxy_enabled': {
    'key': 'telegram_proxy_enabled',
    'type': 'boolean'
  },
  'telegram_proxy_url': {
    'key': 'telegram_proxy_url',
    'type': 'text'
  },
  'telegram_ca_file': {
    'key': 'telegram_ca_file',
    'type': 'text'
  },
  'telegram_skip_tls_verify': {
    'key': 'telegram_skip_tls_verify',
    'type': 'boolean'
  },
  'notify_deposit_created': {
    'key': 'notify_deposit_created',
    'type': 'boolean'
  },
  'notify_deposit_confirmed': {
    'key': 'notify_deposit_confirmed',
    'type': 'boolean'
  },
  'deposit_min_amount': {
    'key': 'deposit_min_amount',
    'type': 'text'
  },
  'notify_gas_low': {
    'key': 'notify_gas_low',
    'type': 'boolean'
  },
  'gas_low_threshold': {
    'key': 'gas_low_threshold',
    'type': 'text'
  },
  'notify_address_pool_low': {
    'key': 'notify_address_pool_low',
    'type': 'boolean'
  },
  'notify_sweep_success': {
    'key': 'notify_sweep_success',
    'type': 'boolean'
  },
  'notify_sweep_failed': {
    'key': 'notify_sweep_failed',
    'type': 'boolean'
  },
  'address': {
    'key': 'address',
    'type': 'text'
  },
  'status': {
    'key': 'status',
    'type': 'text'
  },
  'id': {
    'key': 'id',
    'type': 'text'
  },
  'tx_hash': {
    'key': 'tx_hash',
    'type': 'text'
  },
  'merchant_order_id': {
    'key': 'merchant_order_id',
    'type': 'text'
  },
  'member_id': {
    'key': 'member_id',
    'type': 'text'
  },
  'callback_url': {
    'key': 'callback_url',
    'type': 'text'
  },
  'amount': {
    'key': 'amount',
    'type': 'text'
  },
  'amount_per_wallet': {
    'key': 'amount_per_wallet',
    'type': 'text'
  },
  'note': {
    'key': 'note',
    'type': 'text'
  },
  'secret': {
    'key': 'secret',
    'type': 'password'
  },
  'code': {
    'key': 'code',
    'type': 'text'
  },
  'verify_code': {
    'key': 'verify_code',
    'type': 'text'
  },
  'chat_id': {
    'key': 'chat_id',
    'type': 'text'
  },
  'bot_token': {
    'key': 'bot_token',
    'type': 'password'
  },
  'wallet_method': {
    'key': 'wallet_method',
    'type': 'select',
    'options': [
      'plugin',
      'private_key'
    ]
  },
  'private_key': {
    'key': 'private_key',
    'type': 'password'
  },
  'addresses': {
    'key': 'addresses',
    'type': 'lines'
  },
  'private_ref': {
    'key': 'private_ref',
    'type': 'text'
  },
  'min_token_balance': {
    'key': 'min_token_balance',
    'type': 'text'
  },
  'min_gas_balance': {
    'key': 'min_gas_balance',
    'type': 'text'
  },
  'wallet_status': {
    'key': 'wallet_status',
    'type': 'text'
  },
  'count': {
    'key': 'count',
    'type': 'number'
  },
  'expire_minutes': {
    'key': 'expire_minutes',
    'type': 'number'
  },
  'force': {
    'key': 'force',
    'type': 'boolean'
  }
}
export const resources: Record<string, Resource> = {
  'wallets': {
    'name': 'USDTWallets',
    'url': '/addresses',
    'list': 'addresses',
    'paged': true,
    'columns': [
      'address',
      'network',
      'token_balance',
      'gas_balance',
      'status',
      'created_at'
    ],
    'query': [
      'network',
      'address',
      'status',
      'min_token_balance',
      'min_gas_balance'
    ],
    'operations': [
      {
        'key': 'generate',
        'url': '/wallets/generate',
        'fields': [
          'network',
          'asset',
          'count'
        ],
        'method': 'POST'
      },
      {
        'key': 'importWallets',
        'url': '/addresses',
        'fields': [
          'network',
          'asset',
          'addresses'
        ],
        'method': 'POST'
      },
      {
        'key': 'refreshBalances',
        'url': '/wallet-balances/refresh',
        'fields': [
          'network',
          'asset'
        ],
        'method': 'POST'
      },
      {
        'key': 'exportWallets',
        'url': '/wallets/export.csv',
        'fields': [
          'network'
        ],
        'method': 'GET',
        'download': true
      },
      {
        'key': 'deleteWallets',
        'url': '/wallets/delete',
        'fields': [],
        'method': 'POST',
        'selection': 'ids'
      }
    ]
  },
  'deposits': {
    'name': 'USDTDeposits',
    'url': '/deposits',
    'list': 'deposits',
    'paged': true,
    'columns': [
      'merchant_order_id',
      'member_id',
      'network',
      'amount',
      'address',
      'status',
      'callback_status',
      'created_at'
    ],
    'query': [
      'network',
      'status',
      'merchant_order_id',
      'member_id',
      'address'
    ],
    'operations': [
      {
        'key': 'createDeposit',
        'url': '/deposits',
        'fields': [
          'network',
          'asset',
          'merchant_order_id',
          'member_id',
          'amount',
          'callback_url',
          'expire_minutes'
        ],
        'method': 'POST'
      },
      {
        'key': 'verifyDeposit',
        'url': '/deposits/verify',
        'fields': [
          'id',
          'tx_hash'
        ],
        'method': 'POST',
        'row': true
      },
      {
        'key': 'retryCallback',
        'url': '/deposits/callback/retry',
        'fields': [
          'id'
        ],
        'method': 'POST',
        'row': true
      },
      {
        'key': 'scan',
        'url': '/worker/scan',
        'fields': [],
        'method': 'POST'
      }
    ]
  },
  'nodes': {
    'name': 'USDTNodes',
    'url': '/chain-nodes',
    'list': 'nodes',
    'columns': [
      'name',
      'network',
      'rpc_url',
      'enabled'
    ],
    'query': [],
    'operations': [
      {
        'key': 'saveNode',
        'url': '/chain-nodes',
        'fields': [
          'network',
          'chain_type',
          'name',
          'rpc_url',
          'local_test_mode',
          'proxy_url',
          'chain_id',
          'token_contract',
          'token_decimals',
          'min_confirmations',
          'scan_lookback_blocks',
          'gas_asset',
          'gas_price_gwei',
          'token_gas_limit',
          'native_gas_limit',
          'explorer_tx_url',
          'enabled'
        ],
        'method': 'POST',
        'row': true
      },
      {
        'key': 'testNode',
        'url': '/chain-nodes/:network/test',
        'fields': [
          'network'
        ],
        'method': 'POST',
        'row': true
      }
    ]
  },
  'transactions': {
    'name': 'USDTTransactions',
    'url': '/chain-transactions',
    'list': 'transactions',
    'columns': [
      'tx_hash',
      'network',
      'kind',
      'amount',
      'to_address',
      'status',
      'created_at'
    ],
    'query': [],
    'operations': [
      {
        'key': 'confirmTransactions',
        'url': '/chain-transactions/confirm',
        'fields': [],
        'method': 'POST'
      },
      {
        'key': 'retryTransactions',
        'url': '/chain-transactions/retry',
        'fields': [],
        'method': 'POST'
      }
    ]
  },
  'gas': {
    'name': 'USDTGas',
    'url': '/gas-distributions',
    'list': 'distributions',
    'columns': [
      'id',
      'network',
      'recipient_count',
      'total_amount',
      'payable_total_amount',
      'status',
      'created_at'
    ],
    'query': [],
    'operations': [
      {
        'key': 'gasCandidates',
        'url': '/gas-candidates',
        'fields': [
          'network',
          'min_token_balance',
          'wallet_status'
        ],
        'method': 'GET',
        'read': true
      },
      {
        'key': 'createGas',
        'url': '/gas-distributions',
        'fields': [
          'network',
          'gas_asset',
          'amount_per_wallet',
          'addresses',
          'note'
        ],
        'method': 'POST'
      },
      {
        'key': 'gasDetail',
        'url': '/gas-distributions/:id',
        'fields': [
          'id'
        ],
        'method': 'GET',
        'row': true,
        'read': true
      },
      {
        'key': 'executeGas',
        'url': '/gas-distributions/:id/execute',
        'fields': [
          'id',
          'wallet_method',
          'private_key'
        ],
        'method': 'POST',
        'row': true
      },
      {
        'key': 'recordGas',
        'url': '/gas-distributions/:id/plugin-result',
        'fields': [
          'id',
          'tx_hash'
        ],
        'method': 'POST',
        'row': true
      }
    ]
  },
  'collection': {
    'name': 'USDTCollection',
    'url': '/collection-candidates',
    'list': 'candidates',
    'columns': [
      'address',
      'token_balance',
      'gas_balance',
      'can_collect',
      'reason'
    ],
    'query': [
      'network'
    ],
    'operations': [
      {
        'key': 'saveCollection',
        'url': '/collection-settings',
        'fields': [
          'network',
          'asset',
          'auto_collect_enabled',
          'auto_collect_time',
          'amount_threshold',
          'settlement_wallet',
          'gas_min_balance',
          'token_contract',
          'collect_token_enabled',
          'collect_native_enabled',
          'gas_price_gwei'
        ],
        'method': 'POST',
        'load': '/collection-settings'
      },
      {
        'key': 'runCollection',
        'url': '/collection/run',
        'fields': [
          'network',
          'asset',
          'verify_code'
        ],
        'method': 'POST',
        'selection': 'addresses',
        'defaults': {
          'force': true
        }
      }
    ]
  },
  'settings': {
    'name': 'USDTSettings',
    'url': '/runtime-settings',
    'columns': [
      'admin_ui_whitelist_ips',
      'order_whitelist_ips',
      'default_deposit_expire_minutes',
      'deposit_underpay_tolerance_rate',
      'worker_scan_interval_seconds',
      'bsc_scan_lookback_blocks',
      'trc_batch_gas_contract_address',
      'tron_grpc_endpoint'
    ],
    'query': [],
    'operations': [
      {
        'key': 'saveRuntime',
        'url': '/runtime-settings',
        'fields': [
          'admin_ui_whitelist_ips',
          'order_whitelist_ips',
          'default_deposit_expire_minutes',
          'deposit_underpay_tolerance_rate',
          'worker_scan_interval_seconds',
          'bsc_scan_lookback_blocks',
          'trc_batch_gas_contract_address',
          'tron_grpc_endpoint'
        ],
        'method': 'POST',
        'load': '/runtime-settings'
      },
      {
        'key': 'resetRuntime',
        'url': '/runtime-settings',
        'fields': [],
        'method': 'DELETE'
      }
    ]
  },
  'notifications': {
    'name': 'USDTNotifications',
    'url': '/notification-events',
    'list': 'events',
    'columns': [
      'event_type',
      'target',
      'status',
      'created_at'
    ],
    'query': [],
    'operations': [
      {
        'key': 'saveNotifications',
        'url': '/notification-settings',
        'fields': [
          'telegram_enabled',
          'telegram_proxy_enabled',
          'telegram_proxy_url',
          'telegram_ca_file',
          'telegram_skip_tls_verify',
          'notify_deposit_created',
          'notify_deposit_confirmed',
          'deposit_min_amount',
          'notify_gas_low',
          'gas_low_threshold',
          'notify_address_pool_low',
          'notify_sweep_success',
          'notify_sweep_failed'
        ],
        'method': 'POST',
        'load': '/notification-settings'
      },
      {
        'key': 'listBindings',
        'url': '/telegram-bindings',
        'fields': [],
        'method': 'GET',
        'read': true
      },
      {
        'key': 'saveBinding',
        'url': '/telegram-bindings',
        'fields': [
          'id',
          'name',
          'chat_id',
          'bot_token',
          'enabled'
        ],
        'method': 'POST'
      },
      {
        'key': 'deleteBinding',
        'url': '/telegram-bindings/:id',
        'fields': [
          'id'
        ],
        'method': 'DELETE'
      },
      {
        'key': 'testNotifications',
        'url': '/notifications/test',
        'fields': [],
        'method': 'POST'
      }
    ]
  },
  'security': {
    'name': 'USDTSecurity',
    'url': '/security/totp',
    'columns': [
      'totp_enabled',
      'totp_secret_saved',
      'totp_bound_at'
    ],
    'query': [],
    'operations': [
      {
        'key': 'setupTotp',
        'url': '/security/totp/setup',
        'fields': [],
        'method': 'POST'
      },
      {
        'key': 'bindTotp',
        'url': '/security/totp/bind',
        'fields': [
          'secret',
          'code'
        ],
        'method': 'POST'
      },
      {
        'key': 'unbindTotp',
        'url': '/security/totp/unbind',
        'fields': [
          'code'
        ],
        'method': 'POST'
      }
    ]
  }
}
