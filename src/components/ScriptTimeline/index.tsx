import React, { useState, useRef, useEffect } from 'react';
import { Typography, Tooltip } from 'antd';
import { ScriptSegment } from '../../interfaces/index';
import './style.less';

const { Text } = Typography;

interface ScriptTimelineProps {
  segments: ScriptSegment[];
  duration: number;
  currentTime?: number;
  onSegmentClick?: (segment: ScriptSegment) => void;
  onTimeUpdate?: (time: number) => void;
}

const TIMELINE_WIDTH = 800;
const TIMELINE_HEIGHT = 80;
const SEGMENT_HEIGHT = 40;
const MARKER_HEIGHT = 10;

const ScriptTimeline: React.FC<ScriptTimelineProps> = ({
  segments,
  duration,
  currentTime = 0,
  onSegmentClick,
  onTimeUpdate
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(0);

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 将时间转换为像素位置
  const timeToPosition = (time: number): number => {
    return (time / duration) * TIMELINE_WIDTH;
  };

  // 将像素位置转换为时间
  const positionToTime = (position: number): number => {
    return (position / TIMELINE_WIDTH) * duration;
  };

  // 处理时间线点击
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    
    // 确保点击位置在有效范围内
    const boundedPosition = Math.max(0, Math.min(clickPosition, TIMELINE_WIDTH));
    setMarkerPosition(boundedPosition);
    
    const newTime = positionToTime(boundedPosition);
    onTimeUpdate && onTimeUpdate(newTime);
  };

  // 处理拖动开始
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleTimelineClick(e);
  };

  // 处理拖动中
  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleTimelineClick(e);
    }
  };

  // 处理拖动结束
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // 处理片段点击
  const handleSegmentClick = (segment: ScriptSegment, e: React.MouseEvent) => {
    e.stopPropagation();
    onSegmentClick && onSegmentClick(segment);
  };

  // 当currentTime变化时更新标记位置
  useEffect(() => {
    setMarkerPosition(timeToPosition(currentTime));
  }, [currentTime, duration]);

  return (
    <div className="script-timeline-container">
      <div 
        ref={timelineRef}
        className="timeline"
        style={{ width: TIMELINE_WIDTH, height: TIMELINE_HEIGHT }}
        onClick={handleTimelineClick}
        onMouseDown={handleDragStart}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {/* 时间刻度 */}
        <div className="timeline-scale">
          {Array.from({ length: Math.ceil(duration / 30) + 1 }).map((_, index) => {
            const timePosition = index * 30;
            return (
              <div 
                key={`scale-${index}`}
                className="timeline-scale-marker"
                style={{ left: timeToPosition(timePosition) }}
              >
                <Text className="timeline-scale-text">{formatTime(timePosition)}</Text>
              </div>
            );
          })}
        </div>
        
        {/* 片段 */}
        <div className="timeline-segments" style={{ height: SEGMENT_HEIGHT }}>
          {segments.map((segment) => {
            const startPos = timeToPosition(segment.startTime);
            const width = timeToPosition(segment.duration);
            
            return (
              <Tooltip 
                key={segment.id}
                title={`${formatTime(segment.startTime)} - ${segment.content.substring(0, 20)}...`}
              >
                <div
                  className="timeline-segment"
                  style={{
                    left: startPos,
                    width: width,
                    height: SEGMENT_HEIGHT
                  }}
                  onClick={(e) => handleSegmentClick(segment, e)}
                />
              </Tooltip>
            );
          })}
        </div>
        
        {/* 当前时间标记 */}
        <div 
          className="timeline-marker"
          style={{ 
            left: markerPosition,
            height: TIMELINE_HEIGHT - MARKER_HEIGHT
          }}
        >
          <div className="timeline-marker-head" />
          <Text className="timeline-marker-time">{formatTime(positionToTime(markerPosition))}</Text>
        </div>
      </div>
    </div>
  );
};

export default ScriptTimeline; 