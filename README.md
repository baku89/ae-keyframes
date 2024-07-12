# ae-keyframe

ae-keyframe is a library for parsing/encoding text-based keyframe data that can be copied to the clipboard from After Effects.

## Installation

```bash
npm install ae-keyframe
```

## Usage

### Parsing keyframes from clipboard data

```ts
import {parseAEKeyframes} from 'ae-keyframe'

const clipboardData = navigator.clipboard.readText()

const keyframes = parseAEKeyframes(clipboardData)
```

### Encoding keyframes to clipboard data

```ts
import {printAEKeyframes, AEKeyframeData} from 'ae-keyframe'

const keyframes: AEKeyframeData = {
	frameRate: 30,
	layers: [
		{
			transform: {
				position: [
					{frame: 0, value: [0, 0]},
					{frame: 30, value: [100, 100]},
				],
			},
		},
	],
}

const clipboardData = printAEKeyframes(keyframes)

navigator.clipboard.writeText(clipboardData)
```

## License

This project is licensed under the [MIT License](LICENSE).

```

```
