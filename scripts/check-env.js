/**
 * 환경 변수 확인 스크립트
 * node scripts/check-env.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
];

console.log('🔍 환경 변수 확인 중...\n');

let allPresent = true;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: 설정되지 않음`);
    allPresent = false;
  }
});

console.log('\n');

if (allPresent) {
  console.log('✅ 모든 필수 환경 변수가 설정되어 있습니다.');
  process.exit(0);
} else {
  console.log('❌ 일부 환경 변수가 설정되지 않았습니다.');
  console.log('   .env 파일을 확인하세요.');
  process.exit(1);
}

