import { debug } from './debug'
import { captcha } from './api'
import * as vscode from 'vscode'
import { promptForOpenOutputChannel, DialogType } from './uiUtils'

const generateHTML = (imageEncoded: string) => `
<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="padding-top: 64px;">
    <img src="data:image/jpeg;base64,${imageEncoded}">
  </body>
</html>`

export async function getUserCaptcha () {
  const image = await captcha()
  if (!image) {
    await promptForOpenOutputChannel('Failed to request captcha image', DialogType.error)
    return null
  }
  const panel = vscode.window.createWebviewPanel('Luogu Captcha', 'Captcha', {
    viewColumn: vscode.ViewColumn.One,
    preserveFocus: true
  })
  panel.webview.html = generateHTML(image.toString('base64'))

  const captchaText = await vscode.window.showInputBox({
    placeHolder: '输入验证码'
  }).then(res => res ? res : null)
  panel.dispose()

  return captchaText
}
