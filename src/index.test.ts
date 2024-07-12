import {describe, expect, it} from 'vitest'

import {parseAEKeyframe, printAEKeyframe} from '.'

describe('parsing', () => {
	it('should decode an effect with color', () => {
		const data = `Adobe After Effects 9.0 Keyframe Data

	Units Per Second	24
	Source Width	1920
	Source Height	1280
	Source Pixel Aspect Ratio	1
	Comp Pixel Aspect Ratio	1

Layer
Effects	Fill #1	Color #4
	Frame	alpha 	red 	green 	blue 	
	22	255	255	0	0	
	78	255	117.605	86.0801	86.0801	

End of Keyframe Data
`

		expect(parseAEKeyframe(data)).toEqual({
			frameRate: 24,
			compSize: [1920, 1280],
			sourcePixelAspectRatio: 1,
			compPixelAspectRatio: 1,
			layers: [
				{
					effects: {
						'Fill #1': {
							'Color #4': [
								{frame: 22, value: [255, 0, 0, 255]},
								{frame: 78, value: [117.605, 86.0801, 86.0801, 255]},
							],
						},
					},
				},
			],
		})
	})

	it('should decode an opacity', () => {
		const data = `Adobe After Effects 9.0 Keyframe Data

	Units Per Second	24
	Source Width	1920
	Source Height	1280
	Source Pixel Aspect Ratio	1
	Comp Pixel Aspect Ratio	1

Layer
Transform	Opacity
	Frame	percent	
	208	0	
	405	100	

End of Keyframe Data
`

		expect(parseAEKeyframe(data)).toEqual({
			frameRate: 24,
			compSize: [1920, 1280],
			sourcePixelAspectRatio: 1,
			compPixelAspectRatio: 1,
			layers: [
				{
					transform: {
						opacity: [
							{frame: 208, value: 0},
							{frame: 405, value: 100},
						],
					},
				},
			],
		})
	})

	it('should decode a time remap', () => {
		const data = `Adobe After Effects 9.0 Keyframe Data

	Units Per Second	24
	Source Width	1920
	Source Height	1280
	Source Pixel Aspect Ratio	1
	Comp Pixel Aspect Ratio	1

Layer
Time Remap
	Frame	seconds	
	0	0	
	14	24.6667	
	22	0	
	35	28.3333	
	680	28.3333	

End of Keyframe Data
`

		expect(parseAEKeyframe(data)).toEqual({
			frameRate: 24,
			compSize: [1920, 1280],
			sourcePixelAspectRatio: 1,
			compPixelAspectRatio: 1,
			layers: [
				{
					timeRemap: [
						{frame: 0, value: 0},
						{frame: 14, value: 24.6667},
						{frame: 22, value: 0},
						{frame: 35, value: 28.3333},
						{frame: 680, value: 28.3333},
					],
				},
			],
		})
	})

	it('decode multiple layers', () => {
		const data = `Adobe After Effects 9.0 Keyframe Data

	Units Per Second	24
	Source Width	1920
	Source Height	1280
	Source Pixel Aspect Ratio	1
	Comp Pixel Aspect Ratio	1

Layer
Transform	Position
	Frame	X pixels	Y pixels	Z pixels	
	20	960	640	0	
	53	1940	640	0	

Layer
Transform	Scale
	Frame	X percent	Y percent	Z percent	
	52	100	100	100	
	78	50	100	100	

End of Keyframe Data
`

		expect(parseAEKeyframe(data)).toEqual({
			frameRate: 24,
			compSize: [1920, 1280],
			sourcePixelAspectRatio: 1,
			compPixelAspectRatio: 1,
			layers: [
				{
					transform: {
						position: [
							{frame: 20, value: [960, 640, 0]},
							{frame: 53, value: [1940, 640, 0]},
						],
					},
				},
				{
					transform: {
						scale: [
							{frame: 52, value: [100, 100, 100]},
							{frame: 78, value: [50, 100, 100]},
						],
					},
				},
			],
		})
	})
})

describe('encoding', () => {
	it('should print an effect with color', () => {
		expect(
			printAEKeyframe({
				frameRate: 24,
				layers: [
					{
						effects: {
							'Fill #1': {
								'Color #4': [
									{frame: 22, value: [255, 0, 0, 255]},
									{frame: 78, value: [117.605, 86.0801, 86.0801, 255]},
								],
							},
						},
					},
				],
			})
		).toEqual(`Adobe After Effects 9.0 Keyframe Data

	Units Per Second	24
	Source Width	1920
	Source Height	1080
	Source Pixel Aspect Ratio	1
	Comp Pixel Aspect Ratio	1

Layer
Effects	Fill #1	Color #4
	Frame
	22	255	255	0	0	
	78	255	117.605	86.0801	86.0801	

End of Keyframe Data
`)
	})

	it('should print a time remap', () => {
		expect(
			printAEKeyframe({
				frameRate: 24,
				layers: [
					{
						timeRemap: [
							{frame: 0, value: 0},
							{frame: 14, value: 24.6667},
							{frame: 22, value: 0},
							{frame: 35, value: 28.3333},
							{frame: 680, value: 28.3333},
						],
					},
				],
			})
		).toEqual(`Adobe After Effects 9.0 Keyframe Data

	Units Per Second	24
	Source Width	1920
	Source Height	1080
	Source Pixel Aspect Ratio	1
	Comp Pixel Aspect Ratio	1

Layer
Time Remap
	Frame
	0	0	
	14	24.6667	
	22	0	
	35	28.3333	
	680	28.3333	

End of Keyframe Data
`)
	})

	it('should print multiple layers', () => {
		expect(
			printAEKeyframe({
				frameRate: 24,
				layers: [
					{
						transform: {
							position: [
								{frame: 20, value: [960, 640, 0]},
								{frame: 53, value: [1940, 640, 0]},
							],
						},
					},
					{
						transform: {
							scale: [
								{frame: 52, value: [100, 100, 100]},
								{frame: 78, value: [50, 100, 100]},
							],
						},
					},
				],
			})
		).toEqual(`Adobe After Effects 9.0 Keyframe Data

	Units Per Second	24
	Source Width	1920
	Source Height	1080
	Source Pixel Aspect Ratio	1
	Comp Pixel Aspect Ratio	1

Layer
Transform	Position
	Frame
	20	960	640	0	
	53	1940	640	0	

Layer
Transform	Scale
	Frame
	52	100	100	100	
	78	50	100	100	

End of Keyframe Data
`)
	})
})
