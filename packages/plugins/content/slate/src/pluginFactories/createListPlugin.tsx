import { Transforms } from 'slate';
import { SlatePlugin } from '../types/SlatePlugin';
import { SlateComponentPluginDefinition } from '../types/slatePluginDefinitions';
import createListItemPlugin from './createListItemPlugin';
import createSimpleHtmlBlockPlugin, {
  HtmlBlockData
} from './createSimpleHtmlBlockPlugin';
import {
  decreaseListIndention,
  getActiveList,
  increaseListIndention
} from './utils/listUtils';
type ListDef = {
  type: string;
  icon?: JSX.Element;
  hotKey?: string;
  tagName: string;
  noButton?: boolean; // for Li, this is automatically
  allListTypes: string[];
  listItem: {
    type: string;
    tagName: string;
  };
};

type ListItemDef<T> = SlateComponentPluginDefinition<HtmlBlockData<T>>;

type CustomizeFunction<T, CT> = (def: ListItemDef<T>) => ListItemDef<CT & T>;

type ListCustomizers<T, CT> = {
  customizeList?: CustomizeFunction<T, CT>;
  customizeListItem?: CustomizeFunction<T, CT>;
};

function createSlatePlugins<T, CT>(
  def: ListDef,
  customizers: ListCustomizers<T, CT> = {}
) {
  return [
    createSimpleHtmlBlockPlugin<T>({
      type: def.type,
      icon: def.icon,
      noButton: def.noButton,
      tagName: def.tagName,

      customAdd: editor => {
        const currentList = getActiveList(editor, def.allListTypes);

        if (!currentList) {
          increaseListIndention(
            editor,
            {
              allListTypes: def.allListTypes,
              listItemType: def.listItem.type,
            },
            def.type
          );
        } else {
          // change type
          Transforms.setNodes(
            editor,
            {
              type: def.type,
            },
            {
              at: currentList[1],
            }
          );
        }
      },
      customRemove: editor => {
        decreaseListIndention(editor, {
          allListTypes: def.allListTypes,
          listItemType: def.listItem.type,
        });
      },
    })(customizers.customizeList),
    createListItemPlugin<T>(def.listItem)(customizers.customizeListItem),
  ];
}

// tslint:disable-next-line:no-any
function mergeCustomizer(c1: any, c2: any): any {
  return {
    // tslint:disable-next-line:no-any
    customizeList(def: any) {
      const def2 = c1?.customizeList ? c1.customizeList(def) : def;
      return c2?.customizeList ? c2.customizeList(def2) : def2;
    },
    // tslint:disable-next-line:no-any
    customizeListItem(def: any) {
      const def2 = c1?.customizeList ? c1.customizeListItem(def) : def;
      return c2?.customizeList ? c2.customizeListItem(def2) : def2;
    },
  };
}

function createListPlugin<T = {}>(def: ListDef) {
  const inner = function<TIn, TOut>(
    innerdef: ListDef,
    customizersIn?: ListCustomizers<TIn, TOut>
  ) {
    const customizablePlugin = function<CT>(
      customizers: ListCustomizers<TOut, CT>
    ) {
      return inner(innerdef, mergeCustomizer(customizersIn, customizers));
    };
    customizablePlugin.toPlugin = (): SlatePlugin[] =>
      createSlatePlugins<TIn, TOut>(innerdef, customizersIn).map(plugin =>
        plugin.toPlugin()
      );
    return customizablePlugin;
  };

  return inner<T, T>(def);
}

export default createListPlugin;
