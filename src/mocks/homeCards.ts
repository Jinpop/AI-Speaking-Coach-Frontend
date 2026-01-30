import cardImage from '../assets/image.png'

export type HomeCardCapability = 'canStudy' | 'canChat' | 'canAnalyze'

export type HomeCard = {
  category: string
  title: string
  description: string
  meta: string
  image: string
  href: string
  requiredCapability: HomeCardCapability
}

export const HOME_CARDS: HomeCard[] = [
  {
    category: '#AI 튜터',
    title: 'AI 튜터가 만드는 몰입 루틴',
    description: '레벨 진단부터 과제 추천까지, 지금의 실력을 기준으로 설계합니다.',
    meta: '3 min read · Intermediate',
    image: cardImage,
    href: '/chat',
    requiredCapability: 'canStudy',
  },
  {
    category: '#Chat',
    title: 'Chat으로 실전 감각 유지하기',
    description: '실시간 피드백과 대화 히스토리로 매일 훈련하세요.',
    meta: '4 min read · Advanced',
    image: cardImage,
    href: '/chat',
    requiredCapability: 'canChat',
  },
  {
    category: '#Analyze',
    title: 'Analyze로 약점을 선명하게',
    description: '데이터 기반 리포트로 성장 포인트를 시각화합니다.',
    meta: '4 min read · Advanced',
    image: cardImage,
    href: '/chat',
    requiredCapability: 'canAnalyze',
  },
]
