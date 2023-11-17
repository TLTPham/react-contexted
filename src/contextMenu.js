import { useEffect, useState } from "react";

const defaultState = structuredClone({
  props: [], style: {}
})

let optionState = defaultState;

const listeners = [];
const onContextMenu = (...options) => {
  options = Array.isArray(options) ? options : [ options ];

  return (e) => {
    e.preventDefault();
    let x = e.clientX;
    let y = e.clientY;
    let right = (e.clientX + 250 > window.innerWidth);
    let bottom = (e.clientY + 25 + 50 * options.length > window.innerHeight);
    right && (x = window.innerWidth - x);
    bottom && (y = window.innerHeight - y);
    let posStyle = {
      ...right && { right: `${x}px` },
      ...!right && { left: `${x}px` },

      ...bottom && { bottom: `${y}px` },
      ...!bottom && { top: `${y}px` },
    };
    optionState = options;
    listeners.forEach((listener) => {
      listener({
        props: options,
        posStyle
      });
    });
  }
}

const useStore = () => {
  const [ state, setState ] = useState(optionState);
  useEffect(() => {
    const handleClick = () => {
      console.log(state)
      setState(defaultState);
    }
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    }
  }, []);
  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [ state ]);
  return {
    ...state
  }
}

export function ContextMenu() {
  const { props, posStyle } = useStore();
  const menuStyle = {
    ...posStyle,
    position: 'absolute',
    zIndex: 1000,
  };
  const menuProps = {
    style: menuStyle,
    onContextMenu: (e) => {
      e.stopPropagation()
      e.preventDefault()
    },
  };
  return props?.length > 0 ?
    <div className={'context-menu'} {...menuProps}>
      {GenerateMenu(props)}
    </div> :
    <></>
}

function GenerateMenu(menuItems) {
  let elements = []
  menuItems.map((item, index) => {
    let disabledClass = item.disabled ? 'disabled' : '';
    const optionProps = {
      onClick: item.optionFunction,
      onContextMenu: (e) => {
        e.stopPropagation();
        e.preventDefault();
      },
      onMouseEnter: (e) => {
        e.target.classList.add('active');
      },
      onMouseLeave: (e) => {
        e.target.classList.remove('active');
      }
    }
    elements.push(
      <div className={`context-menu-item ${disabledClass}`} key={`context-menu-item-${index}`} {...optionProps}>
        {item.label}
      </div>
    )
    item.divider && elements.push(
      <div className={`context-menu-divider ${disabledClass}`} key={`context-menu-divider-${index}`}/>
    )
  })
  return elements;
}

module.exports = {
  ContextMenu,
  onContextMenu
}