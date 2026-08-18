import { Category } from '../types';

// Admin email list - add your admin emails here
export const ADMIN_EMAILS: string[] = [
  'lch200048@gmail.com',
  'admin@example.com',
  'admin@column.kr',
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'society', name: '사회', description: '현대 사회의 다양한 이슈와 담론, 공존을 위한 생각', order: 1 },
  { id: 'it-ai', name: 'IT·AI', description: '인공지능과 혁신 기술, 디지털이 바꾸는 미래의 풍경', order: 2 },
  { id: 'economy', name: '경제', description: '글로벌 경제 흐름과 시장, 개인의 지속가능한 금융', order: 3 },
  { id: 'culture', name: '문화', description: '문학과 예술, 영화, 음악을 통해 마주하는 시대적 감수성', order: 4 },
  { id: 'travel', name: '여행', description: '낯선 공간에서 발견하는 새로운 시선과 길 위의 여정', order: 5 },
  { id: 'life', name: '라이프', description: '일상의 소소한 가치, 취향, 웰니스와 라이프스타일', order: 6 },
  { id: 'education', name: '교육', description: '배움과 성장의 본질, 다음 세대를 위한 사유', order: 7 },
  { id: 'essay', name: '에세이', description: '개인의 고유한 사유와 삶의 결이 담긴 진솔한 고백', order: 8 },
  { id: 'region', name: '지역', description: '골목과 도시, 로컬 생태계가 품은 고유한 이야기', order: 9 },
  { id: 'etc', name: '기타', description: '틀에 얽매이지 않는 자유로운 시선과 다양한 담론', order: 10 },
];

export const SAMPLE_COVER_PRESETS = [
  {
    label: 'AI & 테크놀로지',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '에디토리얼 서재',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '도시와 건축',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '자연과 사유',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '차와 사색',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '예술과 갤러리',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
  },
];
