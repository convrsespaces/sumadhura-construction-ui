"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IoPlay } from "react-icons/io5";
import "./CountdownTimer.css";
import "./ConstructionProgressUI.css";
import { getConstructionEvents, ConstructionEvent } from "../services/api";



// Countdown Timer Component
const CountdownTimer = ({ constructionEvents }: { constructionEvents: ConstructionEvent[] }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [targetDate, setTargetDate] = useState<Date | null>(null);

  useEffect(() => {
    // Debug: Log all events and their expected dates
    console.log('🔍 All construction events:', constructionEvents);
    console.log('🔍 Events with expected_date field:', constructionEvents.filter(event => event.expected_date));
    
    // Find the latest expected_date from construction events
    const getLatestExpectedDate = () => {
      if (constructionEvents.length === 0) {
        // If no events, use a default date (1 year from now)
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() + 1);
        console.log('📅 No events found, using default date:', defaultDate.toISOString());
        return defaultDate;
      }

      // Only use expected_date field (as requested)
      const eventsWithExpectedDate = constructionEvents.filter(event => event.expected_date);
      
      if (eventsWithExpectedDate.length === 0) {
        // No events have expected_date - show warning and try to use date field as fallback
        console.warn('⚠️ No events have expected_date field! Trying to use date field as fallback.');
        console.log('📅 Available events:', constructionEvents.map(e => ({ title: e.title, date: e.date, expected_date: e.expected_date })));
        
        // Try to use the date field as fallback
        const eventsWithDate = constructionEvents.filter(event => event.date);
        if (eventsWithDate.length > 0) {
          const highestCompletionEvent = eventsWithDate.reduce((highest, current) => {
            return current.completionPercentageAtEvent > highest.completionPercentageAtEvent ? current : highest;
          });
          const targetDate = new Date(highestCompletionEvent.date);
          console.log('📅 Using date field as fallback from highest completion event:', highestCompletionEvent.title, 'Completion:', highestCompletionEvent.completionPercentageAtEvent + '%', 'Date:', targetDate.toISOString());
          return targetDate;
        }
        
        // No valid date found - return null to indicate no countdown should be shown
        console.log('📅 No valid date found for countdown - no events have expected_date or date fields');
        return null;
      }

      // Find the event with the highest completion percentage
      const highestCompletionEvent = eventsWithExpectedDate.reduce((highest, current) => {
        return current.completionPercentageAtEvent > highest.completionPercentageAtEvent ? current : highest;
      });

      const targetDate = new Date(highestCompletionEvent.expected_date!);
      console.log('📅 Using expected_date from highest completion event:', highestCompletionEvent.title, 'Completion:', highestCompletionEvent.completionPercentageAtEvent + '%', 'Date:', targetDate.toISOString());
      return targetDate;
    };

    const calculatedTargetDate = getLatestExpectedDate();
    setTargetDate(calculatedTargetDate);
    let overdueLogged = false; // Flag to prevent spam logging

    const calculateTimeLeft = () => {
      // If no target date is available, don't show countdown
      if (!calculatedTargetDate) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const now = new Date().getTime();
      const difference = calculatedTargetDate.getTime() - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        
        // Reset overdue flag when project is no longer overdue
        if (overdueLogged) {
          overdueLogged = false;
        }
        
        // Debug log (only log once per minute to avoid spam)
        if (seconds === 0) {
          console.log('⏰ Countdown:', `${days}d ${hours}h ${minutes}m ${seconds}s remaining`);
        }
      } else {
        // Project is overdue
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        
        // Only log overdue message once to prevent spam
        if (!overdueLogged) {
          console.log('⚠️ Project is overdue! Target date:', calculatedTargetDate.toLocaleDateString());
          overdueLogged = true;
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [constructionEvents]);

  const formatDate = () => {
    const currentDate = new Date();
    return currentDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="countdown-container">
      {/* Date */}
      <div className="countdown-date">
        {formatDate()}
      </div>
      
      {/* Countdown Timer */}
      <div className="countdown-timer">
        {targetDate ? (
          <div className="countdown-timer-content">
            <div className="countdown-unit">
              <div className="countdown-number">{timeLeft.days.toString().padStart(2, '0')}</div>
              <div className="countdown-label">Days</div>
            </div>
            <div className="countdown-separator">|</div>
            <div className="countdown-unit">
              <div className="countdown-number">{timeLeft.hours.toString().padStart(2, '0')}</div>
              <div className="countdown-label">Hours</div>
            </div>
            <div className="countdown-separator">|</div>
            <div className="countdown-unit">
              <div className="countdown-number">{timeLeft.minutes.toString().padStart(2, '0')}</div>
              <div className="countdown-label">Min</div>
            </div>
            <div className="countdown-separator">|</div>
            <div className="countdown-unit">
              <div className="countdown-number">{timeLeft.seconds.toString().padStart(2, '0')}</div>
              <div className="countdown-label">Secs</div>
            </div>
          </div>
        ) : (
          <div className="countdown-no-date">
            <div className="countdown-no-date-text">No target date set</div>
            <div className="countdown-no-date-subtext">Add expected_date to events to see countdown</div>
          </div>
        )}
      </div>
      
      {/* Label */}
      <div className="countdown-completion-label">
        {/* <div className="countdown-completion-text">Predicted completion</div> */}
        <div className="countdown-target-date">
          {(() => {
            // Only use expected_date field (as requested)
            const eventsWithExpectedDate = constructionEvents.filter(event => event.expected_date);
            
            if (eventsWithExpectedDate.length > 0) {
              const highestCompletionEvent = eventsWithExpectedDate.reduce((highest, current) => {
                return current.completionPercentageAtEvent > highest.completionPercentageAtEvent ? current : highest;
              });
              const targetDate = new Date(highestCompletionEvent.expected_date!);
              const now = new Date();
              const isOverdue = targetDate < now;
              return `Expected Completion: ${targetDate.toLocaleDateString()} (${highestCompletionEvent.completionPercentageAtEvent}%)${isOverdue ? ' (Overdue)' : ''}`;
            }

            // No expected_date found - try to use date field as fallback
            const eventsWithDate = constructionEvents.filter(event => event.date);
            if (eventsWithDate.length > 0) {
              const highestCompletionEvent = eventsWithDate.reduce((highest, current) => {
                return current.completionPercentageAtEvent > highest.completionPercentageAtEvent ? current : highest;
              });
              const targetDate = new Date(highestCompletionEvent.date);
              const now = new Date();
              const isOverdue = targetDate < now;
              return `Target: ${targetDate.toLocaleDateString()} (Using date field, ${highestCompletionEvent.completionPercentageAtEvent}%)${isOverdue ? ' (Overdue)' : ''}`;
            }
            
            return `No target date set`;
          })()}
        </div>
      </div>
    </div>
  );
};

// Simple function to check if URL is a YouTube video
const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

// Function to get YouTube embed URL
const getYouTubeEmbedUrl = (url: string): string => {
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  
  return url;
};

// Video Modal Component
const VideoModal = ({ isOpen, onClose, videoUrl, posterUrl, title }: {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  posterUrl: string;
  title: string;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isPlaying) {
        // User exited fullscreen manually, pause the video
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isPlaying]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);

      // Request fullscreen after a short delay to ensure video starts playing
      setTimeout(() => {
        if (videoRef.current && videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
          });
        }
      }, 100);
    }
  };

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;

      // Exit fullscreen if video is in fullscreen mode
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.log('Exit fullscreen failed:', err);
        });
      }
    }
    setIsPlaying(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="video-modal-overlay">
      <div className="video-modal-container">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="video-modal-close-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

                 {/* Video container */}
         <div className="video-container">
           {isYouTubeUrl(videoUrl) ? (
             // YouTube video - use iframe
             <iframe
               src={getYouTubeEmbedUrl(videoUrl)}
               title={title}
               className="video-element"
               frameBorder="0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
             />
           ) : (
             // Direct video file - use video element
             <>
               <video
                 ref={videoRef}
                 className="video-element"
                 poster={posterUrl}
                 controls
                 onPlay={() => setIsPlaying(true)}
                 onPause={() => setIsPlaying(false)}
                 onEnded={() => setIsPlaying(false)}
               >
                 <source src={videoUrl} type="video/mp4" />
                 Your browser does not support the video tag.
               </video>

               {/* Play button overlay */}
               {!isPlaying && (
                 <div className="play-button-overlay">
                   <button
                     onClick={handlePlay}
                     className="play-button"
                   >
                     <IoPlay size={32} />
                   </button>
                 </div>
               )}
             </>
           )}
         </div>

        {/* Title */}
        <div className="video-title-container">
          <h3 className="video-title">{title}</h3>
        </div>
      </div>
    </div>
  );
};



// Component for the radial gradient background
const RadialGradientBackground = () => (
  <div className="radial-gradient-bg">
    <div className="radial-gradient-bg-inner"></div>
  </div>
);

const ConstructionProgressUI = () => {
  const [selectedVideo, setSelectedVideo] = useState<{
    videoUrl: string;
    posterUrl: string;
    title: string;
  } | null>(null);

  const [constructionEvents, setConstructionEvents] = useState<ConstructionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Number of bars for proportional layout
  const NUM_BARS = 200;

  // Fetch construction events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getConstructionEvents();

        if (response.success && response.data) {
          setConstructionEvents(response.data);
        } else {
          setError(response.message || 'Failed to fetch construction events');
        }
      } catch (err) {
        setError('Network error occurred while fetching events');
        console.error('Error fetching construction events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Calculate bar index for each event based on percentage
  const eventBarIndices = constructionEvents.map(event => {
    const barIndex = Math.round((event.completionPercentageAtEvent / 100) * (NUM_BARS - 1));
    return barIndex;
  });

  // Find the last event (highest completion percentage) for use in both event box and bar rendering
  let lastEventIndex = 0;
  let highestPercentage = 0;
  constructionEvents.forEach((ev, evIdx) => {
    if (ev.completionPercentageAtEvent > highestPercentage) {
      highestPercentage = ev.completionPercentageAtEvent;
      lastEventIndex = evIdx;
    }
  });

  // Handle event click
  const handleEventClick = (event: ConstructionEvent) => {
    console.log('Event clicked:', event);
    setSelectedVideo({
      videoUrl: event.url || '',
      posterUrl: event.poster || '',
      title: event.title
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="construction-progress-container">
        <RadialGradientBackground />
        <div className="logo-container">
          <Image
            src="/logo.webp"
            alt="Sumadhura Logo"
            width={200}
            height={80}
            className="logo-image"
          />
          
        </div>
        
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading construction events...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="construction-progress-container">
        <RadialGradientBackground />
        <div className="logo-container">
          <Image
            src="/logo.webp"
            alt="Sumadhura Logo"
            width={200}
            height={80}
            className="logo-image"
          />
        </div>
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="construction-progress-container">
      <RadialGradientBackground />

      {/* Logo in top left corner */}
      <div className="logo-container">
        <Image
          src="/logo.webp"
          alt="Sumadhura Logo"
          width={200}
          height={80}
          className="logo-image"
        />
      </div>

      {/* Plaris Royale Logo in top right corner */}
      <div className="plaris-logo-container">
        <Image
          src="/plaris-royale-logo.png"
          alt="Plaris Royale Logo"
          width={150}
          height={60}
          className="plaris-logo-image"
        />
      </div>

      <div className="progress-viewport-wrapper">

        {/* Full screen centered line */}
        <div className="progress-line-container">
          <div className="progress-scroll-container" style={{ overflowX: 'hidden' }}>

            {/* Progress bars container */}
            <div className="progress-bars-container" style={{ width: '100%', minWidth: 'unset', padding: '0 10vw 0 3vw', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>

              {/* Render bars, and render event pill as a child of the corresponding bar */}
              {Array.from({ length: NUM_BARS }, (_, index) => {
                let pill = null;
                // If this bar matches an event, render the pill as a child
                const eventIndex = eventBarIndices.indexOf(index);
                if (eventIndex !== -1) {
                  const event = constructionEvents[eventIndex];
                  // Find which segment this event bar is in for height calculation
                  const eventPoints = constructionEvents.map(event => ({
                    barIndex: Math.round((event.completionPercentageAtEvent / 100) * (NUM_BARS - 1)),
                    percentage: event.completionPercentageAtEvent
                  })).sort((a, b) => a.barIndex - b.barIndex);
                  let prev = { barIndex: 0, percentage: 0 };
                  let next = null;
                  for (let i = 0; i < eventPoints.length; i++) {
                    if (index < eventPoints[i].barIndex) {
                      next = eventPoints[i];
                      break;
                    }
                    prev = eventPoints[i];
                  }
                  // Calculate bar height for this event
                  const baseHeight = 8 + 28;
                  const curvePower = 3;
                  const localProgress = next ? (index - prev.barIndex) / (next.barIndex - prev.barIndex) : 1;
                  const curvedProgress = Math.pow(localProgress, curvePower);
                  const minHeight = baseHeight + prev.percentage * 2;
                  const maxHeight = baseHeight + (next ? next.percentage : prev.percentage) * 2;
                  const eventBarHeight = minHeight + (maxHeight - minHeight) * curvedProgress;

                  const isLastEvent = eventIndex === lastEventIndex;
                  pill = (
                    <>
                      {/* Main pill/video container */}
                      <div
                        key={event.id}
                        className="event-box-container"
                        style={{
                          position: 'absolute',
                          left: isLastEvent ? '100%' : '50%',
                          transform: isLastEvent ? 'translateX(8px)' : 'translateX(-50%)', // Reduced gap for completion text
                          bottom: isLastEvent ? `${Math.max(baseHeight, eventBarHeight) + 20}px` : `${Math.max(baseHeight, eventBarHeight) + 12}px`, // Video closer to completion text
                          zIndex: 1000000,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isLastEvent ? 'flex-start' : 'center',
                          maxWidth: isLastEvent ? '320px' : undefined,
                          }}
                      >
                        {isLastEvent ? (
                          // Show simplified video thumbnail for last event
                          <div
                            className="last-event-video-container"
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'flex-start',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="last-event-video-thumbnail">
                              {event.poster ? (
                                <Image
                                  src={event.poster}
                                  alt={event.title}
                                  width={200}
                                  height={120}
                                  className="last-event-video-image"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div
                                className={`last-event-video-placeholder ${event.poster ? 'hidden' : ''}`}
                              >
                                <Image
                                  src="/videoimg.png"
                                  alt="Default video thumbnail"
                                  width={200}
                                  height={120}
                                  className="last-event-video-image"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="last-event-video-placeholder hidden">
                                  <div style={{ color: '#9ca3af' }}>
                                    <IoPlay size={24} />
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Video title text below video */}
                            <div className="last-event-video-title">
                              {event.title}
                            </div>
                          </div>
                        ) : (
                          // Show yellow pill for all other events
                          <div
                            className="event-pill-wrapper"
                            style={{ width: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                          >
                            <div
                              className="event-pill"
                              tabIndex={0}
                              onClick={() => handleEventClick(event)}
                            >
                              {event.completionPercentageAtEvent}%
                            </div>
                            <div className="event-pill-tooltip">
                              <div className="event-pill-tooltip-inner">
                                <div className="event-pill-video-container">
                                  <Image
                                    src={event.poster || "/videoimg.png"}
                                    alt={event.title}
                                    width={150}
                                    height={90}
                                    className="event-pill-video"
                                  />
                                  <div className="event-pill-video-overlay">
                                    <button
                                      className="event-pill-play-button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEventClick(event);
                                      }}
                                    >
                                      <IoPlay size={24} />
                                    </button>
                                  </div>
                                </div>
                                <div className="event-pill-tooltip-title">{event.title}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      
                    </>
                  );
                }
                // --- Piecewise curved growth between events ---
                // Find all event bar indices and their percentages
                const eventPoints = constructionEvents.map(event => ({
                  barIndex: Math.round((event.completionPercentageAtEvent / 100) * (NUM_BARS - 1)),
                  percentage: event.completionPercentageAtEvent
                })).sort((a, b) => a.barIndex - b.barIndex);
                // Find which segment this bar is in
                let prev = { barIndex: 0, percentage: 0 };
                let next = null;
                for (let i = 0; i < eventPoints.length; i++) {
                  if (index < eventPoints[i].barIndex) {
                    next = eventPoints[i];
                    break;
                  }
                  prev = eventPoints[i];
                }
                // If after the last event, render as inactive/default
                if (!next) {
                  // Check if this is actually the last event bar (has a pill)
                  const hasEventPill = eventIndex !== -1;
                  const barColor = hasEventPill ? '#fde047' : '#666666';
                  const barOpacity = hasEventPill ? 0.8 : 0.5;
                  
                  // Calculate proper height for the last event
                  let barHeight = 40; // default height for inactive bars
                  if (hasEventPill) {
                    // Use the last event's percentage to calculate proper height
                    const baseHeight = 8 + 28;
                    const lastEventPercentage = prev.percentage;
                    barHeight = baseHeight + lastEventPercentage * 2;
                  }
                  
                  return (
                    <div
                      key={`inactive-bar-${index}`}
                      className="progress-bar"
                      style={{
                        height: `${Math.max(40, barHeight)}px`,
                        width: hasEventPill ? '1.5rem' : '0.25rem',
                        border: hasEventPill ? '1px solid #fde047' : 'none',
                        backgroundColor: barColor,
                        opacity: barOpacity,
                        position: 'relative',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                      }}
                    >
                      {pill}
                    </div>
                  );
                }
                // Interpolate height between prev and next event using a curve
                const baseHeight = 8 + 28;
                const curvePower = 3; // Cubic curve: slow start, steep rise at end
                const localProgress = (index - prev.barIndex) / (next.barIndex - prev.barIndex);
                const curvedProgress = Math.pow(localProgress, curvePower);
                const minHeight = baseHeight + prev.percentage * 2;
                const maxHeight = baseHeight + next.percentage * 2;
                const barHeight = minHeight + (maxHeight - minHeight) * curvedProgress;
                // Set bar color: yellow for event bars, white for others
                const hasEventPill = eventIndex !== -1;
                const barColor = hasEventPill ? '#fde047' : 'white';
                return (
                  <div
                    key={`progressive-bar-${index}`}
                    className="progress-bar"
                                          style={{
                        height: `${Math.max(baseHeight, barHeight)}px`,
                        width: hasEventPill ? '1.5rem' : '0.25rem',
                        border: hasEventPill ? '1px solid #fde047' : 'none',
                        backgroundColor: barColor,
                        opacity: 0.8,
                        position: 'relative',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                      }}
                  >
                    {pill}
                  </div>
                );
              })}
              
              {/* Completion percentage text at the end of progress bar */}
              {constructionEvents.length > 0 && (
                <div 
                  className="progress-completion-text"
                  style={{
                    position: 'absolute',
                    left: '90%',
                    bottom: '22px',
                    transform: 'translateY(50%)',
                    zIndex: 1000001,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '0.25rem',
                    minWidth: 'fit-content',
                    marginLeft: '0.5rem',
                  }}
                >
                  <div className="completion-percentage">
                    {highestPercentage}%
                  </div>
                  <div className="completion-label">
                    Completed
                  </div>
                </div>  
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.videoUrl || ""}
        posterUrl={selectedVideo?.posterUrl || ""}
        title={selectedVideo?.title || ""}
      />

      <CountdownTimer constructionEvents={constructionEvents} />

    </div>
  );
};

export default ConstructionProgressUI;