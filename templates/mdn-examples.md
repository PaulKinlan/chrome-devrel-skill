# MDN examples specification

## Requirements

- At least one working example per method/property page
- Examples must run in a live sample ({{EmbedLiveSample}})
- Code must be testable, not pseudo-code
- Include error handling where the API can fail
- Show realistic use cases, not toy demos
- Accessibility: examples must be keyboard-navigable and screen-reader friendly

## Example structure

```html
<div id="example">
  <!-- UI elements -->
</div>

<pre
  class="brush: js"
>
// Clear, commented code
// Show setup, usage, and cleanup
</pre>

<pre class="brush: css">
/* Minimal styling */
</pre>

{{EmbedLiveSample("Example description", "100%", "200")}}
```

## Anti-patterns

- Console.log-only examples (not interactive)
- Examples that require undocumented setup
- Examples that work only on one browser without noting it
- Examples that ignore error cases
