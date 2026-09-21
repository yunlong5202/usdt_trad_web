export default {
  gasContracts: {
    title: 'GAS 批量分发合约',
    hint: 'BSC 与 TRON 分别使用各自的合约地址。这里显示已保存的配置状态，链上执行结果以交易为准。',
    noAccess: '查看和修改分发合约需要业务设置权限，请联系管理员。',
    address: '当前合约地址', configured: '已配置', unconfigured: '未配置', loadFailed: '读取失败',
    edit: '编辑 {chain} 合约', editAddress: '{chain} 合约地址', save: '保存 {chain}',
    saveHint: '仅保存这条链的合约地址；其余配置保持服务端当前值。请核对目标网络和已部署的合约。',
    saved: '{chain} 合约地址已保存', invalidAddress: '请输入有效的 {chain} 合约地址'
  },
  mentions: {
    deliveryFailed: '通知未全部发送成功：成功 {sent}，失败 {failed}。请查看返回详情。',
    hint: '按事件设置需要提及的 Telegram 用户。留空表示该事件不提及用户。',
    placeholder: "例如 {'@'}operator1 {'@'}operator2",
    events: {
      deposit_created: '创建订单时提及', deposit_confirmed: '确认到账时提及', gas_low: 'GAS 不足时提及', address_pool_low: '地址池不足时提及',
      sweep_success: '归集成功时提及', sweep_failed: '归集失败时提及', deposit_callback_failed: '商户回调失败时提及', test_notice: '测试通知时提及'
    }
  },
  collectionFlow: {
    selectEligible: '选择所有可归集地址', select: '选择归集', selectAddress: '选择归集地址 {address}', selected: '已选择 {count} 个地址',
    targetRequired: '请填写本次归集收款地址', confirm: '即将在 {network} 上归集 {count} 个钱包到 {target}。请核对网络、地址和选中钱包，确认后将提交真实链上交易。'
  },
  gasFlow: {
    pickTitle: '选择 GAS 分发地址', pickHint: '先按网络和余额筛选，勾选收款地址后填写每个地址的分发金额。每次最多显示 1000 个地址。',
    selection: '{network}：已选 {count} 个地址，共匹配 {total} 个', useSelected: '用选中地址创建分发单',
    tronPrivateKey: 'TRC20 分发使用私钥签名；私钥仅用于本次操作，提交后从页面清除。', privateKeyRequired: '请输入本次签名的钱包私钥',
    confirm: '即将在 {network} 上向 {count} 个地址分发 GAS，应付总额 {amount} {asset}。确认后将提交真实链上交易。'
  },
  fundsFlow: { realTransfer: '这是实际资金操作。请核对网络、地址和金额后执行。', confirmTitle: '确认链上资金操作' },
  'memberAddresses': {
    'title': '会员地址绑定',
    'description': '同一会员在同一网络和资产下复用固定地址；切回按订单分配仍保留绑定。',
    'empty': '暂无会员地址绑定',
    'memberPlaceholder': '搜索会员编号'
  },
  'runtime': {
    'title': '业务设置',
    'intro': '集中管理收款地址、商户接入、订单规则和扫链参数。',
    'integrationTab': '收款与商户接入',
    'runtimeTab': '订单与运行参数',
    'addressTitle': '收款地址分配',
    'addressHint': '决定新订单如何获取收款地址，一会员一地址在这里设置。',
    'addressMode': '默认分配方式',
    'modes': {
      'one_order': {
        'title': '一订单一地址',
        'hint': '每笔新订单从地址池分配地址，适合按订单独立收款。'
      },
      'member_reuse': {
        'title': '一会员一地址',
        'hint': '按会员编号、网络和资产绑定地址，同一会员后续订单复用该地址。'
      },
      'app_reuse': {
        'title': '一应用一地址',
        'hint': '按应用编号、网络和资产绑定地址，同一应用后续订单复用该地址。'
      }
    },
    'addressChangeHint': '这里设置未指定分配方式时的默认值。商户创建订单时可指定分配方式；会员模式需传会员编号，应用模式需传应用编号。已有订单与绑定不因切换默认值而删除。',
    'viewBindings': '查看会员地址绑定',
    'orderTitle': '订单规则',
    'orderHint': '设置默认付款时限。到账核验的少付规则按链节点独立配置。',
    'expiryHint': '订单未指定有效期时使用此值，超时后进入过期状态。',
    'toleranceLabel': '历史少付比例（只读兼容字段）',
    'toleranceHint': '历史保存值为 {amount}%，不参与当前到账核验。请到链节点配置按比例或固定数量的少付规则。',
    'accessTitle': '访问白名单',
    'accessHint': '管理端与商户订单接口分别控制，留空表示不限制来源 IP。',
    'whitelistPlaceholder': '每行一个 IP 或 CIDR，也可用逗号或分号分隔',
    'adminWhitelistHint': '限制业务管理接口的访问来源，保存前请确保包含你的出口 IP。',
    'orderWhitelistHint': '限制商户创建和查询订单的来源 IP，请填写商户服务端出口 IP。',
    'scanTitle': '扫链频率与回溯',
    'scanHint': '调整自动检查到账的频率及 BSC 初次扫描范围。',
    'scanIntervalHint': '自动扫链每轮之间的间隔，单位为秒；更短的间隔会增加 RPC 请求量。',
    'lookbackHint': 'BSC 初次补扫的区块数量；其他网络的配置在链节点中管理。',
    'tronTitle': 'TRON 运行参数',
    'tronHint': 'TRON 批量 GAS 分发与 gRPC 连接使用的参数。',
    'contractHint': '填写当前使用的 TRON 批量分发合约地址（T 开头）。',
    'grpcHint': '使用主机名:端口格式，例如 grpc.trongrid.io:50051，不带 https://。',
    'unsaved': '有未保存的修改',
    'savedState': '当前设置已与服务端同步',
    'positiveNumber': '请输入大于 0 的整数',
    'invalidTolerance': '请输入 0 到 100 之间的百分比（不含 100）',
    'discard': '放弃修改',
    'discardConfirm': '放弃当前未保存的修改，并重新载入服务端设置？',
    'saveSuccess': '设置已保存并生效'
  },
  'systemConfig': {
    'save': '保存收款与接入设置',
    'secretSaved': '已保存；留空保留原值',
    'secretEmpty': '填写密钥',
    'missing': '服务端缺少配置项，请检查配置初始化：{keys}',
    'groups': {
      'merchant': {
        'title': '商户接口与验签',
        'hint': '配置商户调用创建订单接口时使用的身份信息和 HMAC 签名。'
      },
      'callback': {
        'title': '到账回调与重试',
        'hint': '配置回调签名、任务处理频率和失败重试策略。'
      },
      'chain': {
        'title': '链上服务与并发',
        'hint': '配置扫描资源和外部链服务凭据；主 RPC、代币与确认数在链节点中管理。'
      },
      'management': {
        'title': '管理与验证标识',
        'hint': '管理接口兼容配置、日志开关及新生成验证码的名称。'
      }
    },
    'fields': {
      'MERCHANT_API_SIGNATURE_ENABLED': {
        'label': '启用商户 HMAC 验签',
        'hint': '启用后，商户请求必须携带有效的身份 Key、时间戳和签名。'
      },
      'MERCHANT_API_KEY': {
        'label': '商户接口 Key',
        'hint': '与商户请求的 X-Merchant-Key 对应。'
      },
      'MERCHANT_API_SECRET': {
        'label': '商户 HMAC 密钥',
        'hint': '商户生成请求签名时使用；留空保留已保存密钥。'
      },
      'MERCHANT_API_SIGNATURE_MAX_SKEW_SECONDS': {
        'label': '签名允许时间偏差（秒）',
        'hint': '超过此时间窗口的签名请求将被拒绝。'
      },
      'CALLBACK_SIGNATURE_ENABLED': {
        'label': '启用回调 HMAC 签名',
        'hint': '为回调请求添加签名，接收方可核验请求来源。'
      },
      'CALLBACK_SIGNING_SECRET': {
        'label': '回调签名密钥',
        'hint': '与商户回调接收端约定的 HMAC 密钥。'
      },
      'CALLBACK_TIMEZONE': {
        'label': '回调时区',
        'hint': '回调时间字段使用的时区，例如 Asia/Shanghai。'
      },
      'CALLBACK_HTTP_TIMEOUT_SECONDS': {
        'label': '回调请求超时（秒）',
        'hint': '单次 HTTP 回调等待响应的最长时间。'
      },
      'CALLBACK_WORKER_INTERVAL_SECONDS': {
        'label': '回调队列检查间隔（秒）',
        'hint': '后台检查待发送回调任务的间隔。'
      },
      'CALLBACK_WORKER_BATCH_SIZE': {
        'label': '每批回调任务数',
        'hint': '每轮最多处理的回调数量。'
      },
      'CALLBACK_MAX_ATTEMPTS': {
        'label': '回调最大尝试次数',
        'hint': '持续失败的任务达到此次数后停止自动尝试。'
      },
      'CALLBACK_RETRY_BASE_SECONDS': {
        'label': '初始重试间隔（秒）',
        'hint': '失败回调的退避重试起始等待时间。'
      },
      'CALLBACK_RETRY_MAX_SECONDS': {
        'label': '最大重试间隔（秒）',
        'hint': '退避重试等待时间的上限。'
      },
      'WORKER_SCAN_CHUNK_CONCURRENCY': {
        'label': '地址分片扫描并发数',
        'hint': '同时处理的扫描分片数量，需结合 RPC 配额设置。'
      },
      'BSC_FALLBACK_RPC_URL': {
        'label': 'BSC 优先 RPC 地址',
        'hint': '填写后，BSC 扫描、余额刷新、归集和 GAS 分发优先使用此地址。'
      },
      'GETBLOCK_ACCESS_TOKEN': {
        'label': 'GetBlock Token',
        'hint': '未填写 BSC 优先 RPC 时，可通过此 Token 使用 GetBlock。'
      },
      'TRON_SCAN_ADDRESS_LIMIT': {
        'label': 'TRON 单轮扫描地址上限',
        'hint': '限制每轮查询的地址数，避免超过链服务配额。'
      },
      'TRON_SCAN_CONCURRENCY': {
        'label': 'TRON 扫描并发数',
        'hint': '同时查询的 TRON 地址数。'
      },
      'TRONGRID_API_BASE': {
        'label': 'TronGrid API 地址',
        'hint': '例如 https://api.trongrid.io/v1。'
      },
      'TRONGRID_API_KEY': {
        'label': 'TronGrid API Key',
        'hint': '用于访问 TronGrid 服务，留空保留已保存密钥。'
      },
      'TRONSCAN_API_BASE': {
        'label': 'TronScan API 地址',
        'hint': '例如 https://apilist.tronscanapi.com。'
      },
      'TRONSCAN_API_KEY': {
        'label': 'TronScan API Key',
        'hint': '用于访问 TronScan 服务，留空保留已保存密钥。'
      },
      'TOTP_ISSUER': {
        'label': '验证码发行方名称',
        'hint': '生成新绑定二维码时在 Google Authenticator 中显示的服务名称。'
      },
      'TOTP_ACCOUNT': {
        'label': '验证码默认账号名称',
        'hint': '兼容账号的默认显示名称；已有验证码绑定不受影响。'
      },
      'ADMIN_API_KEY': {
        'label': '兼容管理接口 API Key',
        'hint': '仅保留旧系统的值，不参与新版管理接口认证。新版使用登录 Token 和角色权限，此项不可编辑。'
      },
      'SQL_LOG_ENABLED': {
        'label': '记录 SQL 日志',
        'hint': '开启数据库语句及非敏感参数日志，用于排查问题。'
      }
    }
  },
  'security': {
    'title': '账号安全',
    'intro': '查看当前账号的 Google 验证器绑定，并使用同一验证码完成登录与资金操作验证。',
    'authenticator': 'Google Authenticator',
    'bound': '已绑定',
    'unbound': '未绑定',
    'boundHint': '当前验证码已启用。登录和需要二次验证的资金操作沿用此绑定。',
    'unboundHint': '当前账号尚未绑定验证码，请完成下方扫码和验证。',
    'currentAccount': '当前账号',
    'legacyHint': '当前账号沿用原系统的 Google 验证器绑定，无需重新扫码。',
    'bindTitle': '绑定 Google 验证器',
    'bindHint': '绑定仅在输入正确的 6 位验证码并确认后生效。',
    'startHint': '在手机打开 Google Authenticator，点击下方按钮生成绑定二维码。',
    'start': '开始绑定',
    'stepScan': '1. 扫描二维码',
    'stepVerify': '2. 输入验证码',
    'qrAlt': 'Google Authenticator 绑定二维码',
    'manualKey': '无法扫码时，可在验证器中手动输入此密钥',
    'codeHint': '输入手机验证器当前显示的 6 位数字。',
    'codePlaceholder': '请输入 6 位验证码',
    'bind': '验证并绑定',
    'invalidCode': '请输入 6 位数字验证码',
    'replaceTitle': '更换或解除绑定',
    'replaceHint': '如需更换手机，请先使用当前验证码解除绑定，再绑定新设备。解绑后资金操作需要重新绑定才能通过二次验证。',
    'currentCode': '当前 Google 验证码',
    'unbindConfirm': '确认解除当前账号的 Google 验证器绑定？解除后请及时重新绑定，以继续进行需要二次验证的资金操作。',
    'bindSuccess': 'Google 验证器已绑定',
    'unbindSuccess': 'Google 验证器已解绑'
  },
  welcome: '管理钱包、充值订单与链上资金操作。',
  'title': {
    'wallets': '钱包管理',
    'deposits': '充值订单',
    'nodes': '链节点',
    'transactions': '链上交易',
    'gas': 'GAS 分发',
    'collection': '资金归集',
    'settings': '运行设置',
    'notifications': '通知管理',
    'security': '安全验证'
  },
  'operations': {
    'diagnoseNotifications': '诊断通知发送',
    'callbackJobs': '查看商户回调队列',
    'generate': '生成钱包',
    'importWallets': '导入地址',
    'refreshBalances': '刷新余额',
    'exportWallets': '导出钱包',
    'deleteWallets': '删除选中钱包',
    'createDeposit': '创建订单',
    'verifyDeposit': '核验到账',
    'retryCallback': '重试回调',
    'scan': '立即扫链',
    'saveNode': '保存节点',
    'testNode': '测试节点',
    'confirmTransactions': '确认交易',
    'retryTransactions': '重试交易',
    'gasCandidates': '查询候选地址',
    'createGas': '创建分发单',
    'gasDetail': '分发详情',
    'executeGas': '签名并发送',
    'recordGas': '登记交易哈希',
    'saveCollection': '归集配置',
    'runCollection': '归集选中地址',
    'saveRuntime': '保存运行设置',
    'resetRuntime': '恢复默认',
    'saveNotifications': '通知配置',
    'listBindings': '查看绑定',
    'saveBinding': '保存 Telegram 绑定',
    'deleteBinding': '删除绑定',
    'testNotifications': '发送测试通知',
    'setupTotp': '生成验证密钥',
    'bindTotp': '绑定验证码',
    'unbindTotp': '解除绑定'
  },
  'fields': {
    'deposit_id': '充值订单编号',
    'attempts': '已尝试次数',
    'max_attempts': '最多尝试次数',
    'next_attempt_at': '下次重试时间',
    'last_error': '最近错误',
    'jobs': '回调任务',
    'max_gas_balance': '最大 GAS 余额',
    'assignment_mode': '地址分配模式',
    'bound_member_id': '绑定会员编号',
    'bound_app_id': '绑定应用编号',
    'app_id': '应用编号',
    'payer_address': '付款地址',
    'callback_attempts': '回调尝试次数',
    'underpay_tolerance_mode': '少付容差方式',
    'underpay_tolerance_rate': '少付比例（0.002 表示 0.2%）',
    'underpay_tolerance_amount': '固定少付数量',
    'telegram_mentions': '通知提及用户',
    'can_collect': '可归集',
    'reason': '说明',
    'network': '网络',
    'chain_type': '链类型',
    'name': '名称',
    'rpc_url': 'RPC 地址',
    'local_test_mode': '本地测试模式',
    'proxy_url': '代理地址',
    'chain_id': '链 ID',
    'token_contract': '代币合约',
    'token_decimals': '代币精度',
    'min_confirmations': '最小确认数',
    'scan_lookback_blocks': '回溯区块数',
    'gas_asset': 'GAS 资产',
    'gas_price_gwei': 'GAS 单价（Gwei）',
    'token_gas_limit': '代币 GAS 上限',
    'native_gas_limit': '原生币 GAS 上限',
    'explorer_tx_url': '交易浏览器地址',
    'enabled': '启用',
    'hot_private_key_saved': 'Hot private key saved',
    'admin_ui_whitelist_ips': '管理端 IP 白名单',
    'order_whitelist_ips': '订单 IP 白名单',
    'default_deposit_expire_minutes': '默认订单有效期（分钟）',
    'deposit_underpay_tolerance_rate': '少付容差比例',
    'worker_scan_interval_seconds': '扫链间隔（秒）',
    'bsc_scan_lookback_blocks': 'BSC 回溯区块数',
    'trc_batch_gas_contract_address': 'TRON 批量 GAS 合约',
    'tron_grpc_endpoint': 'TRON gRPC 节点',
    'asset': '资产',
    'auto_collect_enabled': '自动归集',
    'auto_collect_time': '自动归集时间',
    'amount_threshold': '归集金额门槛',
    'settlement_wallet': '归集收款地址',
    'gas_min_balance': '最小 GAS 余额',
    'collect_token_enabled': '归集代币',
    'collect_native_enabled': '归集原生币',
    'telegram_enabled': 'Telegram 通知',
    'telegram_proxy_enabled': '使用代理',
    'telegram_proxy_url': 'Telegram 代理',
    'telegram_ca_file': 'CA 证书路径',
    'telegram_skip_tls_verify': '跳过 TLS 校验',
    'notify_deposit_created': '订单创建通知',
    'notify_deposit_confirmed': '到账通知',
    'deposit_min_amount': '最小通知金额',
    'notify_gas_low': 'GAS 不足通知',
    'gas_low_threshold': 'GAS 不足门槛',
    'notify_address_pool_low': '地址池不足通知',
    'notify_sweep_success': '归集成功通知',
    'notify_sweep_failed': '归集失败通知',
    'address': '钱包地址',
    'status': '状态',
    'id': '编号',
    'tx_hash': '交易哈希',
    'merchant_order_id': '商户订单号',
    'member_id': '会员编号',
    'callback_url': '回调地址',
    'amount': '金额',
    'amount_per_wallet': '每个地址分发金额',
    'note': '备注',
    'secret': '验证密钥',
    'code': '验证码',
    'verify_code': 'Google 验证码',
    'chat_id': '聊天编号',
    'bot_token': 'Bot Token',
    'wallet_method': '签名方式',
    'private_key': '私钥',
    'addresses': '地址（每行一个）',
    'private_ref': '私钥引用',
    'min_token_balance': '最小 USDT 余额',
    'min_gas_balance': '最小 GAS 余额',
    'wallet_status': '钱包状态',
    'count': '数量',
    'expire_minutes': '订单有效期（分钟）',
    'force': '强制执行',
    'token_balance': 'USDT 余额',
    'gas_balance': 'GAS 余额',
    'created_at': '创建时间',
    'callback_status': '回调状态',
    'kind': '交易类型',
    'to_address': '收款地址',
    'recipient_count': '收款地址数',
    'total_amount': '合计金额',
    'payable_total_amount': '应付金额',
    'event_type': '事件类型',
    'target': '目标',
    'totp_enabled': '已启用验证',
    'totp_secret_saved': '密钥已保存',
    'totp_bound_at': '绑定时间'
  },
  'options': {
    'plugin': '浏览器钱包签名',
    'private_key': '私钥签名',
    'one_order': '一订单一地址',
    'member_reuse': '一会员一地址',
    'app_reuse': '一应用一地址',
    'rate': '按比例',
    'fixed': '固定数量'
  },
  'submit': '确认执行',
  'cancel': '取消',
  'result': '执行结果',
  'confirm': '请核对以下参数，确认后执行。',
  'selectFirst': '请先选择记录',
  'success': '操作完成',
  'loadFailed': '加载失败，请重试',
  'refresh': '刷新',
  'noWallet': '请先安装并解锁钱包插件',
  'submitted': '交易已发送，请保留哈希，勿重复发送',
  'detail': '查看详情'
}
