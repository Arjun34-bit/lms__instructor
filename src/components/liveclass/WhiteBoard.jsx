import React, { useRef, useEffect, useState } from "react";

const TOOL_PEN = "pen";
const TOOL_ERASER = "eraser";

const WhiteBoard = ({ onCanvasReadyStream }) => {
  const canvasRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [tool, setTool] = useState(TOOL_PEN);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = 800;
    canvas.height = 500;

    context.lineCap = "round";
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    setCtx(context);
  }, []);

  useEffect(() => {
    if (!ctx) return;
    ctx.strokeStyle = tool === TOOL_ERASER ? "#ffffff" : color;
    ctx.lineWidth = lineWidth;
  }, [tool, color, lineWidth, ctx]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    if (!ctx) return;
    const pos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!ctx || !isDrawing) return;
    const pos = getMousePos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const stream = canvasRef.current.captureStream(15);
    if (onCanvasReadyStream) {
      console.log("canvas stream", stream);
      onCanvasReadyStream(stream);
    }
  }, []);

  return (
    <div
      style={{
        padding: 10,
        background: "#f4f4f4",
        borderRadius: 8,
        width: "fit-content",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <label>
          ✏️ Color:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={tool === TOOL_ERASER}
            style={{ marginLeft: 5 }}
          />
        </label>

        <label>
          🖌️ Size:
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            style={{ marginLeft: 5 }}
          />
        </label>

        <button onClick={() => setTool(TOOL_PEN)} disabled={tool === TOOL_PEN}>
          ✍️ Pen
        </button>
        <button
          onClick={() => setTool(TOOL_ERASER)}
          disabled={tool === TOOL_ERASER}
        >
          🧽 Eraser
        </button>
        <button onClick={clearCanvas}>🧼 Clear</button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #ccc",
          cursor: tool === TOOL_ERASER ? "cell" : "crosshair",
          borderRadius: 4,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default WhiteBoard;
