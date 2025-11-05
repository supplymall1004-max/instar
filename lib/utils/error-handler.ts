/**
 * @file lib/utils/error-handler.ts
 * @description 통합 에러 처리 유틸리티
 * API 에러, 네트워크 에러를 통합 처리하고 사용자 친화적 메시지 제공
 */

export interface ApiError {
  error?: string;
  message?: string;
  details?: string;
}

/**
 * 네트워크 에러 타입 확인
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  if (error instanceof Error) {
    return error.message.includes('network') || error.message.includes('Network');
  }
  return false;
}

/**
 * HTTP 상태 코드에 따른 사용자 친화적 에러 메시지
 */
export function getErrorMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return '잘못된 요청입니다. 입력한 내용을 확인해주세요.';
    case 401:
      return '로그인이 필요합니다.';
    case 403:
      return '권한이 없습니다.';
    case 404:
      return '요청한 내용을 찾을 수 없습니다.';
    case 429:
      return '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
    case 500:
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    case 503:
      return '서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
}

/**
 * API 응답에서 에러 메시지 추출
 */
export function extractErrorMessage(
  response: Response | null,
  apiError: ApiError | null,
  defaultMessage: string = '오류가 발생했습니다.'
): string {
  // 네트워크 에러
  if (!response) {
    return '인터넷 연결을 확인해주세요.';
  }

  // HTTP 상태 코드 기반 메시지
  if (!response.ok) {
    return getErrorMessageForStatus(response.status);
  }

  // API 응답의 에러 메시지
  if (apiError) {
    if (apiError.message) {
      return apiError.message;
    }
    if (apiError.error) {
      return apiError.error;
    }
  }

  return defaultMessage;
}

/**
 * fetch 응답을 안전하게 처리하고 에러 추출
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null; result: any }> {
  try {
    const response = await fetch(url, options);
    const result = await response.json().catch(() => null);

    // 응답이 성공적이지만 result.success가 false인 경우
    if (response.ok && result && !result.success) {
      return {
        data: null,
        error: extractErrorMessage(response, result),
        result,
      };
    }

    // HTTP 에러 상태
    if (!response.ok) {
      return {
        data: null,
        error: extractErrorMessage(response, result),
        result,
      };
    }

    // 성공
    return {
      data: result.data || result,
      error: null,
      result,
    };
  } catch (error) {
    // 네트워크 에러
    if (isNetworkError(error)) {
      return {
        data: null,
        error: '인터넷 연결을 확인해주세요.',
        result: null,
      };
    }

    // 기타 에러
    return {
      data: null,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      result: null,
    };
  }
}

