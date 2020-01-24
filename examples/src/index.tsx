import '@henrylatour/core/lib/index.css'; // we also want to load the stylesheets
import Editor from '@henrylatour/editor';
import '@henrylatour/ui/lib/index.css';
import React from 'react';
import ReactDOM from 'react-dom';
// The content state
import content from './contents';
import customLayoutPluginWithInitialState from './customLayoutPluginWithInitialState';
import { plugins } from './plugins';
import './styles.css';
import { Button } from '@material-ui/core';

if (
  process.env.NODE_ENV !== 'production' &&
  process.env.REACT_APP_TRACE_UPDATES
) {
  const { whyDidYouUpdate } = require('why-did-you-update');
  whyDidYouUpdate(React);
}

const onViewChange = (e: any) => {
  if (e && e.length > 0) {
    alert(`View -> ${e}`)
  };
};

const defaultPlugin = customLayoutPluginWithInitialState();
// tslint:disable-next-line:no-any
const KeepStateEditor = ({ value, ...props }: any) => {
  const [state, setState] = React.useState(value);
  const [readOnly, setReadOnly] = React.useState(true);
  const [editorRef, setEditorRef] = React.useState();

  const setRef = (editor: any) => {
    if (!editorRef) {
      setEditorRef(editor);
    }
  }

  if(editorRef){
    console.log(editorRef);
    console.log(editorRef.store.getState());
    console.log(editorRef.trigger.mode.insert.toString());
  }


  const btnText = readOnly ? 'Begin Editing' : 'Submit Changes';

  const onClick = () => setReadOnly(!readOnly);

  console.log(editorRef);

  // here you would normally persist the state somewhere (e.g a database)
  // <Editor /> is stateful, so you don't nesseary have to keep the value updated
  // if you do, you have to guarantee that the value is referencially equal to what has been passed by `onChange`
  // or the editor will blur its fields (and other problems)
  return (
    <React.Fragment>
      <Button onClick={onClick}>{btnText}</Button>
      <Editor
        setEditorRef={setRef}
        onViewChange={onViewChange}
        {...props}
        value={state}
        onChange={setState}
        plugins={plugins}
        defaultPlugin={defaultPlugin}
        readOnly={readOnly}
      />
    </React.Fragment>);
};
// Render the editables - the areas that are editable
const element = document.getElementById('editable');
ReactDOM.render(
  <KeepStateEditor
    value={content}
  // onChange={s => console.log('on change, new state', s)}
  />,
  element
);
// // Render as beautified mark up (html)
// ReactDOM.render(
//   <Editor plugins={plugins} value={contents[0]} readOnly={true} />,
//   document.getElementById('editable-static')
// );
