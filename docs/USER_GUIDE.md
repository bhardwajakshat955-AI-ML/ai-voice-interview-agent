# User guide (for recruiters)

1. Open the site. You'll see the landing page for Akshat Bhardwaj's Personal AI Assistant.
2. Press **Start interview**.
3. Ask a question in one of three ways:
   - Press **Ask by voice**, speak, then pause. Your words appear as you talk and are sent when you stop.
   - Tap one of the suggested question chips.
   - Type in the box and press **Enter** (Shift+Enter for a new line) or **Send**.
4. The answer appears on screen and is read aloud.

## Status indicator
- *Ready for your question* — idle.
- *Listening…* — microphone is active (red pulsing dot).
- *Thinking…* — the question is being answered.
- *Speaking* — audio playback is running (animated bars).

## Microphone permission
The first time you press **Ask by voice**, your browser asks for microphone access. Allow it to use voice. If you decline (or the site is not on HTTPS/localhost), you'll see a message and can keep using the text box. To re-enable, click the padlock/site-info icon in the address bar and set Microphone to Allow, then reload.

## Audio controls
- **Stop audio** — interrupts the current answer.
- **Replay answer** — plays the last answer again.
- **Mute voice / Unmute voice** — toggles spoken answers; text answers continue.

## Text mode
Typing works in every browser. Voice input requires Chrome, Edge or Safari; Firefox does not support speech recognition, and the app automatically shows a note and hides the voice button there.

## Demo mode
If the **Demo mode** badge is visible, the backend has no AI provider key configured. Answers are still accurate and in Akshat's voice, but they are prepared from his CV using keyword matching rather than a live language model, so unusual phrasings may get a general answer that invites you to ask about a listed topic. Each demo answer is labelled under the message.

## Reset
Press **Reset** in the header and confirm to clear the conversation. **Exit** returns to the landing page (also clears the session).

## Privacy
Speech recognition and playback happen inside your browser; audio is never uploaded. Your typed or transcribed question is sent to the app's backend (and, if a provider is configured, to that AI provider) to generate the answer. Nothing is stored after you close the tab. See [PRIVACY.md](PRIVACY.md).
