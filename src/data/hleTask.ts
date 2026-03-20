
import { 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  FileText,
  Briefcase,
  GraduationCap
} from 'lucide-react';

export const HLE_TASK_DATA = {
  id: 'hle-eval-001',
  title: 'HLE评测集构建任务',
  intro: {
    background: "邀请领域专家共同构建HLE评测集。专家需运用专业知识、工作经验，设计题目并撰写参考答案（含COT过程），同时完成模型验证。",
    rules: [
      {
        title: "真实场景",
        desc: "题目必须来自真实工作场景的真实问题！禁止使用公开题库、考试题、讲义例题。",
        icon: Briefcase,
        highlight: true
      },
      {
        title: "数据脱敏",
        desc: "题目尽量不要涉及保密/隐私内容。如包含私域细节，必须进行脱敏处理。",
        icon: ShieldAlert,
        highlight: true
      },
      {
        title: "题目类型",
        desc: "支持【封闭题目】和【半开放题目】。参考答案需包含详细的推理/COT过程。",
        icon: FileText,
        highlight: false
      },
      {
        title: "质量要求",
        desc: "禁止抄袭。质检只有两次【打回返修】机会，第三次不合格直接作废，不予结算。",
        icon: AlertTriangle,
        highlight: true
      }
    ],
    cases: {
      good: [
        {
          title: "运维日志分析",
          desc: "提供一段真实的服务器错误日志，要求定位慢查询原因。包含具体的参数和环境上下文。",
          reason: "场景真实，有唯一证据链。"
        },
        {
          title: "MCU电压监控",
          desc: "设计电路遇到的LDO输入电压压降问题，提供电路图参数，询问核心原因。",
          reason: "考察专业硬件知识，非通识可答。"
        }
      ],
      bad: [
        {
          title: "合同法定义",
          desc: "请简述什么是不可抗力？",
          reason: "教科书式提问，无业务场景，模型易通过训练数据回答。"
        },
        {
          title: "模糊的图表分析",
          desc: "上传一张不清晰的波形图，问‘这是什么问题’。",
          reason: "信息缺失，无法进行逻辑推演。"
        }
      ]
    }
  },
  quiz: [
    {
      id: 1,
      question: "关于题目来源，以下哪项是正确的？",
      options: [
        "A. 可以直接复制行业从业资格考试的真题",
        "B. 必须基于真实工作场景遇到的问题进行编写或改编",
        "C. 可以翻译国外的教科书例题",
        "D. 可以使用公司内部绝密数据且不进行脱敏"
      ],
      answer: "B"
    },
    {
      id: 2,
      question: "关于质检流程，以下说法错误的是？",
      options: [
        "A. 质检方有两次打回返修的机会",
        "B. 第三次质检仍不合格，将直接判定为不合格",
        "C. 第一次质检不合格可以直接判定为不合格",
        "D. 质检方不得擅自修改出题专家的题目内容"
      ],
      answer: "C"
    },
    {
      id: 3,
      question: "参考答案的撰写要求是？",
      options: [
        "A. 仅提供最终结果即可",
        "B. 需要包含详细的解题步骤、COT推理过程及解释",
        "C. 只要模型能答对，参考答案可以省略",
        "D. 参考答案可以模糊，保留解释空间"
      ],
      answer: "B"
    },
    {
      id: 4,
      question: "如果题目涉及公司内部私域数据，应该怎么处理？",
      options: [
        "A. 直接使用，保证真实性最重要",
        "B. 必须进行脱敏处理，去除敏感信息",
        "C. 仅在标题注明“保密”",
        "D. 发送给管理员审核后再决定"
      ],
      answer: "B"
    },
    {
      id: 5,
      question: "以下哪种题目属于Badcase？",
      options: [
        "A. 某建筑工地的混凝土配比在特定湿度下凝固异常的分析",
        "B. 某电商大促期间数据库死锁日志的排查",
        "C. 请列举牛顿三定律并举例说明",
        "D. 针对某特定型号数控机床的刀具磨损异常判断"
      ],
      answer: "C"
    }
  ]
};
