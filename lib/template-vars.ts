/** 비로그인 사용자를 가리키는 이름 */
export const GUEST_NAME = 'Guest'

type TemplateVars = {
  /** {{user}} 로 치환할 이름 */
  user: string
  /** {{char}} 로 치환할 캐릭터 이름 (없으면 그대로 둔다) */
  char?: string
}

/** 캐릭터 시트의 {{user}} / {{char}} 자리표시자를 실제 이름으로 바꾼다 */
export function fillTemplateVars(text: string, vars: TemplateVars): string {
  let result = text.replace(/\{\{\s*user\s*\}\}/gi, vars.user)
  if (vars.char) result = result.replace(/\{\{\s*char\s*\}\}/gi, vars.char)
  return result
}
