export const translations = {
  zh: {
    common: {
      appName: 'TuringArena',
      login: '登录 / 注册',
      signup: '注册',
      loginOrSignup: '登录 / 注册',
      logout: '退出登录',
      newChat: '新对话',
      credits: '积分',
      settings: '设置',
      language: '语言',
      back: '返回',
      submit: '提交',
      modify: '修改',
      approve: '确认并发布',
      loading: '加载中...',
    },
    landing: {
      badge: '算力之巅，灵感之源，打造AI与人类协作的新纪元',
      hero: {
        line1: '当',
        line2: '极致理性',
        line3: '遇见',
        line4: '人类直觉',
        desc: '加入全球精英专家网络，为下一代 AI 注入灵魂。',
        descBold1: '挑战算法边界',
        descBold2: '赢取丰厚回报',
        descEnd: '，共同定义智能未来。',
        ctaRequester: '我是数据需求方',
        ctaExpert: '我是领域专家',
      },
      features: {
        title: '为什么选择',
        card1: {
          title: 'AI 原生工作流',
          desc: '工作台随任务而变。无论是法律审查还是创意写作，界面都会自动进化以最大化效率。',
        },
        card2: {
          val: '2.5倍',
          desc: '更高效率',
        },
        card3: {
          title: '全球人才',
          desc: '连接来自 150+ 国家的专家。',
        },
        card4: {
          tag: '新功能',
          title: '游戏化认证',
          desc: '告别枯燥的简历。通过互动挑战、测验和沙箱模拟来证明您的技能。',
          btn: '尝试挑战',
        },
      },
      marquee: {
        rlhf: 'RLHF 训练',
        annotation: '数据标注',
        prompt: '提示词工程',
        eval: '模型评测',
      },
      footer: {
        copyright: '© 2026 TuringArena Labs, Inc.',
        cookieSettings: 'Cookie 设置',
        explore: '探索更多',
        columns: {
          company: {
            title: '公司',
            links: ['关于我们', '招贤纳士', '安全', '系统状态', '条款与隐私', '您的隐私权']
          },
          product: {
            title: '产品',
            links: ['数据标注', 'RLHF', '模型评测', 'API 文档', '价格方案']
          },
          resources: {
            title: '资源',
            links: ['帮助中心', '博客', '社区', '集成', '模板', '合作伙伴']
          },
          useCases: {
            title: 'TuringArena 适用于',
            links: ['企业', '初创公司', '学术研究', '个人开发者']
          }
        }
      },
    },
    requester: {
      sidebar: {
        kickoff: '智能立项',
        projects: {
          title: '项目管理',
          search: '搜索项目...',
          create: '新建项目',
          columns: {
            name: '项目名称',
            status: '状态',
            progress: '进度',
            tasks: '任务数',
            updated: '最近更新',
            actions: '操作'
          },
          status: {
            active: '进行中',
            completed: '已完成',
            planning: '规划中',
            archived: '已归档'
          }
        },
        tasks: '任务管理',
        analytics: '数据报表',
        settings: '企业设置',
        role: '需求方',
      },
      dashboard: {
        title: '智能立项助手',
        subtitle: '描述您的数据需求。TuringArena 将自动规划工作流、预算及人才画像。',
        greeting: '您好！我是您的专属项目架构师。今天需要什么样的数据？',
        placeholder: '请清晰描述：\n1. 项目基础信息：项目名称、项目描述、项目周期、正式/测试\n2. 项目人员：项目经理、成本方、需求方\n3. 法务评估：确认legal链接已完结',
        input: {
          attach: '参考资料',
          fast: '快速',
          write: '帮我写作',
          tone: '更改语气',
          length: '调整长度',
          polish: '全文润色',
        },
        analyzing: '正在拆解需求并匹配专家画像...',
        blueprint: '项目蓝图',
        generated: 'AI 生成',
        workflow: '建议工作流',
        workflowSteps: ['数据清洗', '专家标注', '质检验收'],
        workflowTags: ['AI 预处理', '人工介入', '混合校验'],
        expertProfile: '匹配专家画像',
        stats: {
          price: '预估单价',
          delivery: '预计交付',
          unit: '条',
          days: '天',
        },
        categories: {
          domains: {
            title: '领域选择',
            items: ['社会科学', '科研', '语言', '创作', '法律', '金融', '教育', '医疗', '软件与AI', '自然科学', '其他']
          },
          dataTypes: {
            title: '数据类型',
            items: ['指令遵循', 'Rubrics', 'HLE', 'RLHF', 'VLM', '长文本处理', '文档处理', '数理推理', '其他']
          }
        },
        agent: {
          missingInfo: '我需要更多细节来完善项目立项。',
          askName: '首先，请给这个项目起一个名称：',
          askDesc: '收到。请简要描述具体的项目需求和交付标准：',
          askDuration: '这个项目的预期周期是多久？（例如：2周，1个月）',
          askPersonnel: '请确认项目人员配置（项目经理、项目Owner、需求方）：',
          askLegal: '最后，请提供法务评估通过的链接以确保合规：',
          confirm: '完美！项目信息已收集完毕，正在生成立项书...',
          thinking: '正在分析需求...',
          suggestions: {
            name: ['数据标注项目', 'RLHF 训练集', '多模态评测'],
            desc: ['需要高质量中文对话数据', '包含代码生成的指令集', '多轮对话逻辑推理'],
            personnel: ['项目经理: Alex', 'Owner: Sarah', '需求方: AI Lab'],
            legal: ['https://legal.example.com/123', '已通过邮件确认', '正在审核中']
          }
        }
      },
    },
    expert: {
      sidebar: {
        hall: '任务大厅',
        workspace: '工作台',
        labeling: '标注工坊',
        community: '专家社区',
        challenges: '声望挑战',
        role: '领域专家',
        level: 'L3 资深专家',
      },
      taskHall: {
        title: '任务大厅',
        subtitle: '发现适合您专业技能的高价值挑战。',
        searchPlaceholder: '搜索任务、技能或领域...',
        stats: {
          level: '当前等级',
          levelDesc: '距离 L4 仅需完成 3 个任务',
          earnings: '本月收益',
          earningsDesc: '击败了 85% 的同行',
          approval: '通过率',
        },
        card: {
          priceUnit: '条',
          left: '剩余名额',
          deadline: '天后截止',
          applied: '人已参与',
          apply: '立即参与',
        },
        modal: {
          title: '资格审查',
          step1: '正在验证专家资质...',
          step1Checks: ['学历背景核验通过', '历史交付质量评估中...'],
          step2: {
            congrats: '恭喜！您的背景完全符合要求。',
            rulesTitle: '正式开始前，请注意以下规则：',
            rulesItems: [
              '标注必须严格遵循2026年合同法更新。',
              '对于模棱两可的条款，请使用"不确定"，切勿猜测。',
              '严禁使用外部生成式 AI 工具。'
            ],
            readyText: '准备好进行快速技能测验了吗？需要满分通过。',
            btn: '我已知晓，开始测验',
          },
          step3: {
            question: '问题 1 / 3',
            back: '上一步',
            submit: '提交答案',
          },
        },
      },
      sandbox: {
        guidedMode: '引导模式',
        autoSaving: '自动保存中...',
        submitTask: '提交任务',
        aiAssistant: 'AI 助手',
         taskGuide: '任务指南',
         instructions: '任务说明',
         instructionText: '请查阅右侧文档。识别所有与 <strong>终止</strong> 和 <strong>责任</strong> 相关的条款。',
         requiredOutput: '交付要求',
        riskLevel: '风险等级评估',
        clauseCat: '条款分类',
        inputPlaceholder: '请求 AI 协助...',
        me: '我',
        docPreview: '文档预览区域',
        welcomeFree: '欢迎来到自由模式沙箱。我准备好协助任何任务。',
        welcomeGuided: '**系统初始化: {title}**\n\n欢迎，专家。我已经加载了 **{domain}** 领域的上下文。\n\n**任务目标**: {desc}\n\n随时吩咐我提取条款、验证事实或起草内容。我们从哪开始？',
        processed: '已处理您的请求。请查看预览面板的更新结果。',
      },
    },
  },
  en: {
    common: {
      appName: 'TuringArena',
      login: 'Log in / Sign up',
      signup: 'Sign up',
      loginOrSignup: 'Log in / Sign up',
      logout: 'Log out',
      newChat: 'New Chat',
      credits: 'Credits',
      settings: 'Settings',
      language: 'Language',
      back: 'Back',
      submit: 'Submit',
      modify: 'Modify',
      approve: 'Approve & Launch',
      loading: 'Loading...',
    },
    landing: {
      badge: 'THE NEW ERA OF HUMAN-AI COLLABORATION',
      hero: {
        line1: 'Where',
        line2: 'Intelligence',
        line3: 'Meets',
        line4: 'Intuition',
        desc: 'Join the elite league of experts training the next generation of AI models.',
        descBold1: 'Challenge limits',
        descBold2: 'earn rewards',
        descEnd: ', and shape the future.',
        ctaRequester: 'I have Data Needs',
        ctaExpert: "I'm an Expert",
      },
      features: {
        title: 'Why',
        card1: {
          title: 'AI-Native Workflow',
          desc: "Our workspace adapts to your task. Whether it's legal review or creative writing, the interface evolves to maximize your efficiency.",
        },
        card2: {
          val: '2.5x',
          desc: 'Higher Efficiency',
        },
        card3: {
          title: 'Global Talent',
          desc: 'Connect with experts from 150+ countries.',
        },
        card4: {
          tag: 'New Feature',
          title: 'Gamified Qualification',
          desc: 'Forget boring resumes. Prove your skills through interactive challenges, quizzes, and real-time simulations.',
          btn: 'Try a Challenge',
        },
      },
      marquee: {
        rlhf: 'RLHF Training',
        annotation: 'Data Annotation',
        prompt: 'Prompt Engineering',
        eval: 'Model Evaluation',
      },
      footer: {
        copyright: '© 2026 TuringArena Labs, Inc.',
        cookieSettings: 'Cookie settings',
        explore: 'Explore more',
        columns: {
          company: {
            title: 'Company',
            links: ['About us', 'Careers', 'Security', 'Status', 'Terms & privacy', 'Your privacy rights']
          },
          product: {
            title: 'Product',
            links: ['Data Annotation', 'RLHF', 'Model Eval', 'API Docs', 'Pricing']
          },
          resources: {
            title: 'Resources',
            links: ['Help center', 'Blog', 'Community', 'Integrations', 'Templates', 'Partner programs']
          },
          useCases: {
            title: 'TuringArena for',
            links: ['Enterprise', 'Startups', 'Research', 'Personal']
          }
        }
      },
    },
    requester: {
      sidebar: {
        kickoff: 'Smart Kick-off',
        projects: {
          title: 'Projects',
          search: 'Search projects...',
          create: 'New Project',
          columns: {
            name: 'Project Name',
            status: 'Status',
            progress: 'Progress',
            tasks: 'Tasks',
            updated: 'Last Updated',
            actions: 'Actions'
          },
          status: {
            active: 'Active',
            completed: 'Completed',
            planning: 'Planning',
            archived: 'Archived'
          }
        },
        tasks: 'Task Management',
        analytics: 'Data Reports',
        settings: 'Enterprise Settings',
        role: 'Requester',
      },
      dashboard: {
        title: 'Smart Kick-off',
        subtitle: 'Describe your data needs. TuringArena will automatically architect the workflow, budget, and talent profile.',
        greeting: "Hello! I'm your AI Project Architect. What kind of data do you need today?",
        placeholder: 'Please describe clearly:\n1. Project Basics: Name, Description, Duration, Official/Test\n2. Personnel: PM, Cost Owner, Requester\n3. Legal: Confirm Legal Link is finalized',
        input: {
          attach: 'Reference',
          fast: 'Fast',
          write: 'Help me write',
          tone: 'Change tone',
          length: 'Adjust length',
          polish: 'Polish',
        },
        analyzing: 'Deconstructing requirements & matching expert profiles...',
        blueprint: 'Project Blueprint',
        generated: 'AI GENERATED',
        workflow: 'Recommended Workflow',
        workflowSteps: ['Data Cleaning', 'Expert Annotation', 'Validation'],
        workflowTags: ['AI Pre-process', 'Human Loop', 'Consensus'],
        expertProfile: 'Expert Profile Match',
        stats: {
          price: 'Est. Unit Price',
          delivery: 'Est. Delivery',
          unit: 'entry',
          days: 'Days',
        },
        categories: {
          domains: {
            title: 'Select Domain',
            items: ['Social Science', 'Research', 'Language', 'Creative Writing', 'Law', 'Finance', 'Education', 'Medical', 'Software & AI', 'Natural Science', 'Other']
          },
          dataTypes: {
            title: 'Data Type',
            items: ['Instruction Following', 'Rubrics', 'HLE', 'RLHF', 'VLM', 'Long Context', 'Document Processing', 'Math/Reasoning', 'Other']
          }
        },
        agent: {
          missingInfo: 'I need a few more details to finalize the project.',
          askName: 'First, what should we name this project?',
          askDesc: 'Got it. Could you briefly describe the requirements and delivery standards?',
          askDuration: 'What is the expected duration? (e.g., 2 weeks)',
          askPersonnel: 'Please confirm the key personnel (PM, Owner, Requester):',
          askLegal: 'Finally, please provide the passed Legal Assessment link:',
          confirm: 'Perfect! Generating project proposal...',
          thinking: 'Analyzing requirements...',
          suggestions: {
            name: ['Data Annotation Project', 'RLHF Training Set', 'Multimodal Eval'],
            desc: ['Need high-quality Chinese dialogue', 'Code generation instruction set', 'Multi-turn reasoning'],
            personnel: ['PM: Alex', 'Owner: Sarah', 'Requester: AI Lab'],
            legal: ['https://legal.example.com/123', 'Confirmed via Email', 'Under Review']
          }
        }
      },
    },
    expert: {
      sidebar: {
        hall: 'Task Hall',
        workspace: 'Workspace',
        labeling: 'Labeling Studio',
        community: 'Community',
        challenges: 'Challenges',
        role: 'Expert',
        level: 'Expert Level 3',
      },
      taskHall: {
        title: 'Task Hall',
        subtitle: 'Discover high-value challenges tailored to your expertise.',
        searchPlaceholder: 'Search tasks, skills, or domains...',
        stats: {
          level: 'Current Level',
          levelDesc: '3 tasks to L4',
          earnings: 'Monthly Earnings',
          earningsDesc: 'Top 15%',
          approval: 'Approval Rate',
        },
        card: {
          priceUnit: 'entry',
          left: 'slots left',
          deadline: 'days left',
          applied: 'participated',
          apply: 'Participate Now',
        },
        modal: {
          title: 'Qualification Check',
          step1: 'Verifying Credentials...',
          step1Checks: ['Background Check Passed', 'Analyzing History...'],
          step2: {
            congrats: 'Congratulations! Your profile is a perfect match.',
            rulesTitle: 'Before we begin, please note the critical rules:',
            rulesItems: [
              'Annotations must strictly follow the 2026 Contract Law updates.',
              'Use "Unsure" for ambiguous clauses; do not guess.',
              'External generative AI tools are strictly prohibited.'
            ],
            readyText: 'Ready for a quick skill check? Perfect score required.',
            btn: 'I Understand, Start Quiz',
          },
          step3: {
            question: 'QUESTION 1 OF 3',
            back: 'Back',
            submit: 'Submit Answer',
          },
        },
      },
      sandbox: {
        guidedMode: 'Guided Mode',
        autoSaving: 'Auto-saving...',
        submitTask: 'Submit Task',
        aiAssistant: 'AI Assistant',
         taskGuide: 'Task Guide',
         instructions: 'Instructions',
         instructionText: 'Please review the document on the right. Identify all clauses related to <strong>Termination</strong> and <strong>Liability</strong>.',
         requiredOutput: 'Required Output',
        riskLevel: 'Risk Level Assessment',
        clauseCat: 'Clause Categorization',
        inputPlaceholder: 'Ask AI to help...',
        me: 'ME',
        docPreview: 'Document Preview Area',
        welcomeFree: "Welcome to the Free Mode Sandbox. I'm ready to help with any task.",
        welcomeGuided: "**System Initialized: {title}**\n\nWelcome, Expert. I have loaded the context for **{domain}** domain.\n\n**Task Goal**: {desc}\n\nI am ready to assist you. You can ask me to extract clauses, verify facts, or draft content. How shall we begin?",
        processed: "I've processed your request. Please check the preview panel for the updated results.",
      },
    },
  },
};
