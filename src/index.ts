import {iterateLines} from './iterateLines'

type vec3 = readonly [x: number, y: number, z: number]

export type AEKeyframeData = {
	frameRate: number
	compSize: readonly [width: number, height: number]
	sourcePixelAspectRatio: number
	compPixelAspectRatio: number
	layers: AELayer[]
}

type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>

export type AEKeyframeDataSource = PartialExcept<
	AEKeyframeData,
	'frameRate' | 'layers'
>

type KeyframeValue = number | readonly number[]

type AELayer = {
	timeRemap?: AEKeyframe<number>[]
	transform?: {
		anchorPoint?: AEKeyframe<vec3>[]
		position?: AEKeyframe<vec3>[]
		scale?: AEKeyframe<vec3>[]
		rotation?: AEKeyframe<number>[]
		opacity?: AEKeyframe<number>[]
	}
	effects?: {
		[name: string]: {
			[property: string]: AEKeyframe<KeyframeValue>[]
		}
	}
}

type AEKeyframe<T = KeyframeValue> = {
	frame: number
	value: T
}

export function parseAEKeyframe(text: string): AEKeyframeData {
	const lines = iterateLines(text)

	// Read header information
	const keyframeData: AEKeyframeData = {
		frameRate: 0,
		compSize: [0, 0],
		sourcePixelAspectRatio: 0,
		compPixelAspectRatio: 0,
		layers: [],
	}

	while (!lines.current().startsWith('Layer')) {
		const [key, value] = lines.current().split('\t')
		switch (key) {
			case 'Units Per Second':
				keyframeData.frameRate = parseInt(value, 10)
				break
			case 'Source Width':
				keyframeData.compSize = [parseInt(value, 10), keyframeData.compSize[1]]
				break
			case 'Source Height':
				keyframeData.compSize = [keyframeData.compSize[0], parseInt(value, 10)]
				break
			case 'Source Pixel Aspect Ratio':
				keyframeData.sourcePixelAspectRatio = parseFloat(value)
				break
			case 'Comp Pixel Aspect Ratio':
				keyframeData.compPixelAspectRatio = parseFloat(value)
				break
		}

		lines.next()
	}

	// Read layers and properties
	let currentLayer: AELayer | null = null

	while (!lines.finished()) {
		const line = lines.current()

		if (line === 'Layer') {
			if (currentLayer) {
				keyframeData.layers.push(currentLayer)
			}
			currentLayer = {}
			lines.next()
		} else if (line === 'End of Keyframe Data') {
			if (currentLayer) {
				keyframeData.layers.push(currentLayer)
			}
			return keyframeData
		} else {
			if (!currentLayer) {
				throw new Error('Unexpected property outside of layer')
			}

			const [type, name, effectProperty] = line.split('\t')

			const labels = lines.next().current().split('\t').slice(1)

			let parse: (strs: string[]) => KeyframeValue

			if (labels.length === 4) {
				// For color, swap the order of channels from ARGB to RGBA
				parse = (strs: string[]) => {
					const [a, r, g, b] = strs.map(parseFloat)
					return [r, g, b, a]
				}
			} else {
				parse = (strs: string[]) => {
					const nums = strs.map(parseFloat)
					return nums.length === 1 ? nums[0] : nums
				}
			}

			const keyframes: AEKeyframe<any>[] = []

			while (lines.next().indent() > 0) {
				const frameLine = lines.current()
				const [frame, ...value] = frameLine.split('\t')

				keyframes.push({
					frame: parseFloat(frame),
					value: parse(value),
				})
			}

			if (type === 'Time Remap') {
				currentLayer.timeRemap = keyframes
			} else if (type === 'Transform') {
				if (!currentLayer.transform) {
					currentLayer.transform = {}
				}

				switch (name) {
					case 'Anchor Point':
						currentLayer.transform.anchorPoint = keyframes
						break
					case 'Position':
						currentLayer.transform.position = keyframes
						break
					case 'Rotation':
						currentLayer.transform.rotation = keyframes
						break
					case 'Scale':
						currentLayer.transform.scale = keyframes
						break
					case 'Opacity':
						currentLayer.transform.opacity = keyframes
						break
				}
			} else {
				if (!currentLayer.effects) {
					currentLayer.effects = {}
				}

				if (!currentLayer.effects[name]) {
					currentLayer.effects[name] = {}
				}

				currentLayer.effects[name][effectProperty] = keyframes
			}
		}
	}

	throw new Error('Unexpected end of file')
}

function printKeyframes(keyframes: AEKeyframe[]): string[] {
	const lines = keyframes.map(({frame, value}) => {
		let str: string

		if (Array.isArray(value)) {
			if (value.length === 4) {
				// For color, swap the order of channels from RGBA to ARGB
				value = [value[3], value[0], value[1], value[2]]
			}
			str = value.join('\t')
		} else {
			str = value.toString()
		}

		return `\t${frame}\t${str}\t`
	})

	return [...lines, '']
}

export function printAEKeyframe(data: AEKeyframeDataSource): string {
	const lines = [
		'Adobe After Effects 9.0 Keyframe Data',
		'',
		`\tUnits Per Second\t${data.frameRate}`,
		`\tSource Width\t${data.compSize?.[0] ?? 1920}`,
		`\tSource Height\t${data.compSize?.[1] ?? 1080}`,
		`\tSource Pixel Aspect Ratio\t${data.sourcePixelAspectRatio ?? 1}`,
		`\tComp Pixel Aspect Ratio\t${data.compPixelAspectRatio ?? 1}`,
		'',
	]

	for (const layer of data.layers) {
		lines.push('Layer')

		if (layer.timeRemap) {
			lines.push('Time Remap', '\tFrame')
			lines.push(...printKeyframes(layer.timeRemap))
		}

		if (layer.transform) {
			if (layer.transform.anchorPoint) {
				lines.push('Transform\tAnchor Point', '\tFrame')
				lines.push(...printKeyframes(layer.transform.anchorPoint))
			}
			if (layer.transform.position) {
				lines.push('Transform\tPosition', '\tFrame')
				lines.push(...printKeyframes(layer.transform.position))
			}
			if (layer.transform.rotation) {
				lines.push('Transform\tRotation', '\tFrame')
				lines.push(...printKeyframes(layer.transform.rotation))
			}
			if (layer.transform.scale) {
				lines.push('Transform\tScale', '\tFrame')
				lines.push(...printKeyframes(layer.transform.scale))
			}
			if (layer.transform.opacity) {
				lines.push('Transform\tOpacity', '\tFrame')
				lines.push(...printKeyframes(layer.transform.opacity))
			}
		}

		if (layer.effects) {
			for (const [name, properties] of Object.entries(layer.effects)) {
				for (const [property, keyframes] of Object.entries(properties)) {
					lines.push(`Effects\t${name}\t${property}`, '\tFrame')
					lines.push(...printKeyframes(keyframes))
				}
			}
		}
	}

	lines.push('End of Keyframe Data')
	lines.push('')

	return lines.join('\n')
}
