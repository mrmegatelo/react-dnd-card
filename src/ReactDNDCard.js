import React, { useRef, useImperativeHandle } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import { treeElements } from '@store/actions';

const style = {
  position: 'relative',
}

const SourceBoxRaw = React.forwardRef(
  ({
    itemKey,
    children,
    isDragging,
    isOver,
    customPreview,
    canDrag,
    connectDragSource,
    connectDropTarget,
    connectDragPreview,
  }, ref) => {
    const elementRef = useRef(null);
    connectDragSource(elementRef);
    connectDropTarget(elementRef);

    const opacity = isDragging ? 1 : 0;

    if (customPreview) {
      connectDragPreview(getEmptyImage(), {
        captureDraggingState: true,
      });
    }

    useImperativeHandle(ref, () => ({
      getNode: () => elementRef.current,
    }));
    return (
      <div
        ref={elementRef}
        style={Object.assign({}, style, {
          cursor: canDrag ? 'move' : 'pointer',
        })}
      >
      <div style={{
        opacity,
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: '#ccc',
        pointerEvents: 'none',
        zIndex: 10
      }}></div>
        {children}
      </div>
    )
  }
)
const SourceBox = DropTarget(
  ({ groupKey }) => groupKey,
  {
    hover: (props, monitor, component) => {
      if (!component) {
        return null;
      }
      const node = component.getNode();
      if (!node) {
        return null;
      }

      if (!monitor.isOver({ shallow: true })) {
        return;
      }

      const dragIndex = monitor.getItem().order;
      const hoverIndex = props.order;
      const dragId = monitor.getItem().id;
      const hoverId = props.id;

      if (dragId === hoverId) {
        return;
      }

      if (monitor.getItem().id === props.parentId) {
        return;
      }

      const hoverBoundingRect = node.getBoundingClientRect();
      const hoverTopTrigger = hoverBoundingRect.top + 10;
      const hoverBottomTrigger = hoverBoundingRect.bottom - 10;
      const hoverLeftTrigger = hoverBoundingRect.left + 30;

      const clientOffset = monitor.getClientOffset();

      const underTheTopBorder = clientOffset.y - hoverTopTrigger;
      const aboveTheBottomBorder = clientOffset.y - hoverBottomTrigger;
      const leftBorder = clientOffset.x - hoverLeftTrigger;

      if (monitor.getItem().parentId === props.parentId) {
        if (dragIndex < hoverIndex && aboveTheBottomBorder < 0) {
          if (leftBorder > 0) {
            props.onChangeParent(monitor.getItem().id, props.id);
            monitor.getItem().parentId = props.id; //хак для корректного восприятия parentId, если мы еще не дропнули элемент
          }
          return;
        }
        if (dragIndex > hoverIndex && underTheTopBorder > 0) {
          if (leftBorder > 0) {
            props.onChangeParent(monitor.getItem().id, props.id);
            monitor.getItem().parentId = props.id; //хак для корректного восприятия parentId, если мы еще не дропнули элемент
          }
          return;
        }
        if (leftBorder < 0) {
          props.onMove(monitor.getItem().id, props.id);
          monitor.getItem().order = hoverIndex; // хак для корректного переключения order, если мы еще не дропнули элемент
        } else {
          props.onChangeParent(monitor.getItem().id, props.id);
          monitor.getItem().parentId = props.id; //хак для корректного восприятия parentId, если мы еще не дропнули элемент
        }
      } else {
        if (monitor.getItem().parentId === props.id) {
          if (underTheTopBorder < 0 && aboveTheBottomBorder > 0 && leftBorder < 0) {
            props.onChangeParent(monitor.getItem().id, props.parentId);
            monitor.getItem().parentId = props.parentId; //хак для корректного восприятия parentId, если мы еще не дропнули элемент
            return;
          }
        } else {
          props.onChangeParent(monitor.getItem().id, props.id);
          monitor.getItem().parentId = props.id; //хак для корректного восприятия parentId, если мы еще не дропнули элемент
        }
      }

      monitor.getItem().prevOrder = hoverIndex;
    },
  },
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
  }),
)(
  DragSource(
    ({ groupKey }) => groupKey,
    {
      beginDrag: (props, monitor) => ({
        id: props.id,
        order: props.order,
        parentId: props.parentId,
        nestedElements: props.nestedElements,
        sourceId: monitor.getSourceId(),
        customPreview: props.customPreview,
        elSize: {
          width: props.width,
        },
      }),
      canDrag: props => props.canDrag,
      isDragging: (props, monitor) => {
        return props.id === monitor.getItem().id && props.sourceId !== null;
      }, // TODO понять, почему это вызывает ошибку, при перетаскивании элемента с вложенными элементами к другому родителю
    },
    (connect, monitor) => ({
      connectDragPreview: connect.dragPreview(),
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging(),
      sourceId: monitor.getSourceId(),
      prevOrder: null,
    }),
  )(SourceBoxRaw),
);

export default SourceBox;
