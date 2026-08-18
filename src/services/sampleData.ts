import { Article, UserProfile } from '../types';

export const INITIAL_AUTHORS: UserProfile[] = [
  {
    uid: 'author_minjun',
    email: 'minjun.kim@column.kr',
    nickname: '김민준 칼럼니스트',
    bio: '디지털 전환과 인공지능이 인간의 삶과 노동에 미치는 영향을 탐구합니다. 전 테크 저널리스트, 현 미래기술연구소 연구위원.',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    role: 'editor',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
    followerCount: 248,
    followingCount: 18,
    articleCount: 5,
    website: 'https://minjun.tech',
  },
  {
    uid: 'author_soyeon',
    email: 'soyeon.lee@column.kr',
    nickname: '이소연 작가',
    bio: '도시의 골목과 일상의 사소한 아름다움을 기록하는 에세이스트. 『천천히 걷는 사람의 속도』 저자.',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    role: 'user',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    followerCount: 395,
    followingCount: 42,
    articleCount: 4,
    website: 'https://soyeon.space',
  },
  {
    uid: 'author_joonhyuk',
    email: 'jh.park@column.kr',
    nickname: '박준혁 이코노미스트',
    bio: '글로벌 거시경제와 신흥 시장의 흐름을 냉철하게 분석합니다. 경제지 칼럼니스트이자 금융 분석가.',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    role: 'user',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
    followerCount: 180,
    followingCount: 12,
    articleCount: 3,
  },
  {
    uid: 'author_chayeon',
    email: 'chayeon.jung@column.kr',
    nickname: '정채연 문화비평가',
    bio: '동시대 시각예술과 대중문화 속 숨겨진 기호를 읽어내는 문화연구자. 미술관과 영화관 사이에서 글을 씁니다.',
    photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    role: 'editor',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 120,
    followerCount: 512,
    followingCount: 65,
    articleCount: 6,
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art_ai_era_readiness',
    authorId: 'author_minjun',
    authorName: '김민준 칼럼니스트',
    authorPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    authorBio: '디지털 전환과 인공지능이 인간의 삶과 노동에 미치는 영향을 탐구합니다.',
    title: 'AI 시대에 우리는 무엇을 준비해야 할까?',
    subtitle: '기술이 빠르게 변하는 시대, 사람이 지켜야 할 사유와 질문의 힘',
    content: `## 질문하는 인간만이 살아남는다

인공지능(AI)이 인간 고유의 영역이라 믿었던 글쓰기, 작곡, 프로그래밍, 심지어 감성적인 상담까지 대체하기 시작했습니다. 대규모 언어 모델(LLM)의 급격한 발전은 우리에게 근본적인 질문을 던집니다.

> "기계가 모든 답을 즉각적으로 내놓는 세상에서, 인간의 사유는 어떤 가치를 가질 것인가?"

답을 찾는 속도보다 중요한 것은 이제 **'어떤 질문을 던질 것인가'**입니다. 인공지능은 주어진 맥락 안에서 방대한 확률적 최적값을 계산할 뿐, 세상에 존재하지 않는 결핍을 발견하거나 새로운 문제의식을 스스로 만들어내지 못합니다.

---

## 1. 정답의 인플레이션과 비판적 사고

오늘날 정보와 정답은 넘쳐납니다. 검색창이나 챗봇에 몇 단어만 입력하면 전문가 수준의 요약본이 쏟아져 나옵니다. 하지만 이러한 '정답의 인플레이션' 시대일수록 필요한 역량은 **비판적 사고(Critical Thinking)**입니다.

- 기계가 제공한 정보의 편향을 식별할 수 있는가?
- 왜곡된 통계나 환각(Hallucination) 현상을 검증할 수 있는가?
- 표면적인 요약 뒤에 감춰진 복잡한 사회적 맥락을 파악할 수 있는가?

이 세 가지 질문에 스스로 대답할 수 없다면, 우리는 AI라는 거대한 연산 시스템의 수동적 소비자에 머무르게 될 것입니다.

---

## 2. 도구에 매몰되지 않는 본질적 사유

우리가 준비해야 할 것은 단순히 '프롬프트 입력 기술'이 아닙니다. 프롬프트 기술은 기술의 인터페이스가 발전할수록 빠르게 무의미해질 것입니다. 오히려 우리가 단련해야 할 것은 철학, 역사, 인간 심리에 대한 깊은 이해입니다.

문맥을 연결하고, 타인의 감정에 공감하며, 도덕적 딜레마 속에서 결단을 내리는 힘은 알고리즘이 대신할 수 없습니다.

## 맺으며: 기술을 길들이는 인간의 따뜻한 통찰

AI는 위협이 아니라 우리가 더 깊은 사유와 창의적 도전에 집중할 수 있도록 돕는 지적 지렛대입니다. 두려움에 사로잡히기보다는, 나만의 고유한 관점과 목소리를 잃지 않는 글쓰기와 대화를 시작해야 할 때입니다.`,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'it-ai',
    categoryName: 'IT·AI',
    tags: ['인공지능', '미래기술', '비판적사고', '칼럼', '에세이'],
    status: 'published',
    viewCount: 1420,
    likeCount: 184,
    commentCount: 28,
    isFeatured: true,
    readTimeMinutes: 5,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: 'art_slow_life_city',
    authorId: 'author_soyeon',
    authorName: '이소연 작가',
    authorPhotoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    authorBio: '도시의 골목과 일상의 사소한 아름다움을 기록하는 에세이스트.',
    title: '빠름을 강요하는 도시에서 천천히 걷는 법',
    subtitle: '스마트폰을 주머니에 넣고 계절의 온도를 만나는 순간들',
    content: `## 신호등 앞에서의 조급함에 대하여

우리는 하루에도 수십 번씩 파란 불이 깜빡일 때 전력 질주를 합니다. 지하철 문이 닫히기 직전 가방을 먼저 밀어 넣고, 1.5배속으로 영상을 시청하며 '시간 효율'을 극대화했다고 자부합니다.

하지만 그 대가로 우리는 무엇을 잃어버렸을까요?

> "효율이라는 단어가 삶의 유일한 나침반이 될 때, 풍경은 사라지고 목적지만 남는다."

---

## 골목이 건네는 위로

주말 아침, 정해진 목적지 없이 익숙한 동네의 뒷골목을 걷기 시작했습니다. 스마트폰을 가방 깊숙이 넣어두고 이어폰을 뺐습니다. 

처음으로 길모퉁이 오래된 목련나무의 꽃봉오리가 터지려는 것을 보았고, 빵집 환기구에서 흘러나오는 고소한 버터 냄새에 걸음을 멈췄습니다. 이것은 지도 앱의 알고리즘이 절대 추천해주지 않는 종류의 작은 발견이었습니다.

- 속도를 줄이면 세상의 해상도가 높아집니다.
- 낭비된 것처럼 보이는 시간 속에서 비로소 고유한 사유가 싹틉니다.

오늘 하루, 단 30분만이라도 여러분만의 '느린 걸음'을 선물해보는 것은 어떨까요?`,
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'essay',
    categoryName: '에세이',
    tags: ['일상', '느린삶', '산책', '에세이', '마음챙김'],
    status: 'published',
    viewCount: 890,
    likeCount: 132,
    commentCount: 15,
    isFeatured: false,
    readTimeMinutes: 4,
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
    updatedAt: Date.now() - 1000 * 60 * 60 * 36,
  },
  {
    id: 'art_macro_economy_shift',
    authorId: 'author_joonhyuk',
    authorName: '박준혁 이코노미스트',
    authorPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    authorBio: '글로벌 거시경제와 신흥 시장의 흐름을 냉철하게 분석합니다.',
    title: '고금리 뉴노멀 시대, 개인의 자산 방어 전략',
    subtitle: '저금리 환상에서 벗어나 현금 흐름 중심의 생존 포트폴리오 구축하기',
    content: `## 공짜 돈의 시대는 끝났다

지난 10여 년간 전 세계를 지배했던 초저금리와 유동성 파티는 완전히 막을 내렸습니다. 이제 금리가 0%대로 돌아가는 일은 쉽게 오지 않을 '뉴노멀'의 문턱에 서 있습니다.

레버리지를 극대화하여 자산을 불리던 기존의 공식은 더 이상 유효하지 않습니다. 지금 필요한 것은 공격적인 수익률 추구가 아닌, **위험 관리와 단단한 현금 흐름의 확보**입니다.

---

## 3가지 핵심 방어 원칙

1. **부채의 질적 재편**: 변동금리 부채를 선제적으로 상환하거나 고정금리로 대환
2. **배당 및 이자 기반 현금 흐름 창출**: 자산 가치 상승에만 의존하지 않는 안전 마진 확보
3. **인플레이션 헷지 자산 분산**: 실물 자산과 글로벌 우량 기업 중심의 장기 분산 투자

변화하는 경제 지형도에서 살아남는 자는 가장 용감한 투자자가 아니라, 시장의 겨울을 가장 오래 버틸 수 있는 체력을 가진 자입니다.`,
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'economy',
    categoryName: '경제',
    tags: ['경제', '금리', '자산관리', '투자전략', '거시경제'],
    status: 'published',
    viewCount: 1150,
    likeCount: 98,
    commentCount: 19,
    isFeatured: false,
    readTimeMinutes: 6,
    createdAt: Date.now() - 1000 * 60 * 60 * 50,
    updatedAt: Date.now() - 1000 * 60 * 60 * 50,
  },
  {
    id: 'art_contemporary_art_gaze',
    authorId: 'author_chayeon',
    authorName: '정채연 문화비평가',
    authorPhotoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    authorBio: '동시대 시각예술과 대중문화 속 숨겨진 기호를 읽어내는 문화연구자.',
    title: '미술관 벽 너머의 세상: 현대미술이 불편한 이유',
    subtitle: '아름다움의 재정의, 우리는 왜 난해한 작품 앞에서 당혹감을 느끼는가',
    content: `## 현대미술은 왜 예쁘지 않을까?

루브르 박물관의 고전 회화 앞에서는 감탄이 나오지만, 현대미술 갤러리에 가면 바닥에 놓인 돌멩이나 찢어진 캔버스 앞에서 사람들은 고개를 갸웃거립니다.

> "이게 도대체 왜 예술인가? 나도 만들 수 있겠는데?"

이 질문은 현대미술을 향한 가장 정직하고 자연스러운 반응입니다. 그러나 현대미술의 핵심은 '기교의 완벽성'이 아니라 **'질문의 도발성'**에 있습니다.

---

## 미학의 전환: 기술에서 개념으로

현대 미술가들은 더 이상 사진기보다 정밀하게 풍경을 그리는 데 관심이 없습니다. 그들은 관람객에게 익숙한 편견과 사회적 금기를 흔들고, 불편한 진실을 마주하게 만듭니다.

작품이 우리를 당혹스럽게 만든다면, 그 작품은 이미 절반의 성공을 거둔 것입니다. 여러분의 굳어진 생각에 틈을 냈기 때문입니다.`,
    coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'culture',
    categoryName: '문화',
    tags: ['문화', '현대미술', '비평', '예술', '전시'],
    status: 'published',
    viewCount: 760,
    likeCount: 110,
    commentCount: 11,
    isFeatured: false,
    readTimeMinutes: 4,
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    updatedAt: Date.now() - 1000 * 60 * 60 * 72,
  },
  {
    id: 'art_education_future_generation',
    authorId: 'author_minjun',
    authorName: '김민준 칼럼니스트',
    authorPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    authorBio: '디지털 전환과 인공지능이 인간의 삶과 노동에 미치는 영향을 탐구합니다.',
    title: '시험지가 사라진 교실, 미래 교육의 진짜 과제',
    subtitle: '지식의 암기가 아닌 협력과 회복탄력성을 가르치는 교육으로의 전환',
    content: `## 산업화 시대의 교실 모델을 넘어서

우리의 교육 제도는 19세기 산업혁명기 공장 노동자를 효율적으로 길러내기 위해 설계된 틀을 여전히 유지하고 있습니다. 종이 울리면 자리에 앉고, 동일한 교재를 읽으며, 하나의 정답을 맞히는 경쟁을 벌입니다.

하지만 미래 세대가 살아갈 세상은 표준화된 정답이 존재하지 않는 복잡계입니다.

---

## 우리가 아이들에게 남겨주어야 할 3가지 역량

1. **회복탄력성 (Resilience)**: 실패를 데이터로 받아들이고 다시 일어서는 힘
2. **진정한 협업 능력**: 다양성을 존중하며 시너지를 창출하는 소통
3. **자기 주도적 호기심**: 타인의 지시 없이도 배우기를 멈추지 않는 내적 동기

교육의 목적은 학생을 하나의 완성된 부품으로 만드는 것이 아니라, 끊임없이 스스로를 갱신할 수 있는 씨앗으로 자라게 돕는 것입니다.`,
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'education',
    categoryName: '교육',
    tags: ['교육', '미래세대', '학교', '성장', '창의성'],
    status: 'published',
    viewCount: 620,
    likeCount: 84,
    commentCount: 8,
    isFeatured: false,
    readTimeMinutes: 5,
    createdAt: Date.now() - 1000 * 60 * 60 * 96,
    updatedAt: Date.now() - 1000 * 60 * 60 * 96,
  }
];
