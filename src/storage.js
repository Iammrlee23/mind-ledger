/**
 * 저장소 어댑터
 * - 배포 환경: 브라우저 localStorage 사용
 * - Claude 아티팩트의 window.storage와 동일한 인터페이스(async get/set/delete)를 유지해
 *   App.jsx 코드를 환경에 상관없이 그대로 쓸 수 있게 한다.
 */
export const storage = {
  async get(key) {
    const value = localStorage.getItem(key);
    return value == null ? null : { key, value };
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value };
  },
  async delete(key) {
    localStorage.removeItem(key);
    return { key, deleted: true };
  },
};
