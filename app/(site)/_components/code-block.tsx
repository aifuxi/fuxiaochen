/* eslint-disable react/no-unescaped-entities */

export function CodeBlock() {
  return (
    <pre className="shadow-2xl text-xs sm:text-sm lg:text-base max-w-max">
      <code className="hljs language-typescript">
        <span className="hljs-keyword">class</span>{' '}
        <span className="hljs-title class_">Person</span> {'{'}
        {'\n'}
        {'  '}
        <span className="hljs-attr">nickname</span>:{' '}
        <span className="hljs-built_in">string</span>;{'\n'}
        {'  '}
        <span className="hljs-attr">gender</span>:{' '}
        <span className="hljs-string">'male'</span> |{' '}
        <span className="hljs-string">'female'</span>;{'\n'}
        {'  '}
        <span className="hljs-attr">age</span>:{' '}
        <span className="hljs-built_in">number</span>;{'\n'}
        {'  '}
        <span className="hljs-attr">skills</span>:{' '}
        <span className="hljs-title class_">Array</span>&lt;
        <span className="hljs-built_in">string</span>&gt;;{'\n'}
        {'  '}
        <span className="hljs-attr">location</span>:{' '}
        <span className="hljs-built_in">string</span>;{'\n'}
        {'\n'}
        {'  '}
        <span className="hljs-title function_">constructor</span>(
        <span className="hljs-params" />) {'{'}
        {'\n'}
        {'    '}
        <span className="hljs-variable language_">this</span>.
        <span className="hljs-property">nickname</span> ={' '}
        <span className="hljs-string font-semibold">'F西'</span>;{'\n'}
        {'    '}
        <span className="hljs-variable language_">this</span>.
        <span className="hljs-property">gender</span> ={' '}
        <span className="hljs-string">'male'</span>;{'\n'}
        {'    '}
        <span className="hljs-variable language_">this</span>.
        <span className="hljs-property">age</span> ={' '}
        <span className="hljs-keyword">new</span>{' '}
        <span className="hljs-title class_">Date</span>().
        <span className="hljs-title function_">getFullYear</span>() -{' '}
        <span className="hljs-number">1999</span>;{'\n'}
        {'    '}
        <span className="hljs-variable language_">this</span>.
        <span className="hljs-property">skills</span> = [{'\n'}
        {'        '}
        <span className="hljs-string font-semibold">'React'</span>,{'\n'}
        {'        '}
        <span className="hljs-string font-semibold">'TypeScript'</span>,{'\n'}
        {'        '}
        <span className="hljs-string font-semibold">'JavaScript'</span>,{'\n'}
        {'        '}
        <span className="hljs-string font-semibold">'Tailwind CSS'</span>
        {'\n'}
        {'    '}];{'\n'}
        {'    '}
        <span className="hljs-variable language_">this</span>.
        <span className="hljs-property">location</span> ={' '}
        <span className="hljs-string">'上海'</span>;{'\n'}
        {'  '}
        {'}'}
        {'\n'}
        {'}'}
        {'\n'}
        {'\n'}
      </code>
    </pre>
  );
}
