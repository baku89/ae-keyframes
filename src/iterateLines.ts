export function iterateLines(text: string) {
	const lines = text.split('\n').filter(line => line.length > 0)

	let i = 0

	return {
		finished() {
			return i >= lines.length
		},
		current() {
			return lines[i].trim()
		},
		next() {
			i++
			return this
		},
		indent() {
			return lines[i].match(/^\t*/)?.[0].length || 0
		},
	}
}
