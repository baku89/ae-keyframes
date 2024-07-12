# ae-keyframes

ae-keyframes is a library for parsing/encoding text-based keyframe data that can be copied to the clipboard from After Effects.

## Installation

```bash
npm install ae-keyframes
```

## Usage

### Parsing keyframes from clipboard data

```ts
import {parseAEKeyframes} from 'ae-keyframes'

const clipboardData = navigator.clipboard.readText()

const keyframes = parseAEKeyframes(clipboardData)
```

### Encoding keyframes to clipboard data

```ts
import {printAEKeyframes, AEKeyframeData} from 'ae-keyframes'

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

### The representation of keyframes in AE

The keyframes are represented as a string that can be copied to the clipboard from After Effects. The format is as follows:

```
Adobe After Effects 9.0 Keyframe Data

	Units Per Second	24
	Source Width	1920
	Source Height	1280
	Source Pixel Aspect Ratio	1
	Comp Pixel Aspect Ratio	1

Layer
Transform	Scale
	Frame	X percent	Y percent	Z percent
	8	100	100	100
	27	179	179	101.13

Transform	Rotation
	Frame	degrees
	27	22

Layer
Time Remap
	Frame	seconds
	0	0
	1	4.58333

Transform	Position
	Frame	X pixels	Y pixels	Z pixels
	0	960	640	0
	10	975	640	0
	13	975	678	0

End of Keyframe Data
```

## License

This project is licensed under the [MIT License](LICENSE).

```

```
