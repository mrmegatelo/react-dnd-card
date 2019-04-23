"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactDnd = require("react-dnd");

var _reactDndHtml5Backend = require("react-dnd-html5-backend");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

var style = {
  position: 'relative'
};

var SourceBoxRaw = _react["default"].forwardRef(function (_ref, ref) {
  var itemKey = _ref.itemKey,
      children = _ref.children,
      isDragging = _ref.isDragging,
      isOver = _ref.isOver,
      customPreview = _ref.customPreview,
      canDrag = _ref.canDrag,
      connectDragSource = _ref.connectDragSource,
      connectDropTarget = _ref.connectDropTarget,
      connectDragPreview = _ref.connectDragPreview;
  var elementRef = (0, _react.useRef)(null);
  connectDragSource(elementRef);
  connectDropTarget(elementRef);
  var opacity = isDragging ? 1 : 0;

  if (customPreview) {
    connectDragPreview((0, _reactDndHtml5Backend.getEmptyImage)(), {
      captureDraggingState: true
    });
  }

  (0, _react.useImperativeHandle)(ref, function () {
    return {
      getNode: function getNode() {
        return elementRef.current;
      }
    };
  });
  return _react["default"].createElement("div", {
    ref: elementRef,
    style: Object.assign({}, style, {
      cursor: canDrag ? 'move' : 'pointer'
    })
  }, _react["default"].createElement("div", {
    style: {
      opacity: opacity,
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      backgroundColor: '#ccc',
      pointerEvents: 'none',
      zIndex: 10
    }
  }), children);
});

var SourceBox = (0, _reactDnd.DropTarget)(function (_ref2) {
  var groupKey = _ref2.groupKey;
  return groupKey;
}, {
  hover: function hover(props, monitor, component) {
    if (!component) {
      return null;
    }

    var node = component.getNode();

    if (!node) {
      return null;
    }

    if (!monitor.isOver({
      shallow: true
    })) {
      return;
    }

    var dragIndex = monitor.getItem().order;
    var hoverIndex = props.order;
    var dragId = monitor.getItem().id;
    var hoverId = props.id;

    if (dragId === hoverId) {
      return;
    }

    if (monitor.getItem().id === props.parentId) {
      return;
    }

    var hoverBoundingRect = node.getBoundingClientRect();
    var hoverTopTrigger = hoverBoundingRect.top + 10;
    var hoverBottomTrigger = hoverBoundingRect.bottom - 10;
    var hoverLeftTrigger = hoverBoundingRect.left + 30;
    var clientOffset = monitor.getClientOffset();
    var underTheTopBorder = clientOffset.y - hoverTopTrigger;
    var aboveTheBottomBorder = clientOffset.y - hoverBottomTrigger;
    var leftBorder = clientOffset.x - hoverLeftTrigger;

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
  }
}, function (connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({
      shallow: true
    })
  };
})((0, _reactDnd.DragSource)(function (_ref3) {
  var groupKey = _ref3.groupKey;
  return groupKey;
}, {
  beginDrag: function beginDrag(props, monitor) {
    return {
      id: props.id,
      order: props.order,
      parentId: props.parentId,
      nestedElements: props.nestedElements,
      sourceId: monitor.getSourceId(),
      customPreview: props.customPreview,
      elSize: {
        width: props.width
      }
    };
  },
  canDrag: function canDrag(props) {
    return props.canDrag;
  },
  isDragging: function isDragging(props, monitor) {
    return props.id === monitor.getItem().id && props.sourceId !== null;
  } // TODO понять, почему это вызывает ошибку, при перетаскивании элемента с вложенными элементами к другому родителю

}, function (connect, monitor) {
  return {
    connectDragPreview: connect.dragPreview(),
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    sourceId: monitor.getSourceId(),
    prevOrder: null
  };
})(SourceBoxRaw));
var _default = SourceBox;
exports["default"] = _default;