"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Typography,
  Avatar,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";

export default function PlayerModal({
  open,
  onClose,
  playerName,
  profilePhoto,
  stats,
  defaultTab = "batting",
}) {
  const tabMapping = { batting: 0, bowling: 1, fielding: 2, mvp: 3 };
  const tabNames = ["Batting", "Bowling", "Fielding", "MVP"];
  const [tab, setTab] = useState(tabMapping[defaultTab] || 0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    setTab(tabMapping[defaultTab] || 0);
  }, [defaultTab]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Custom SVG Icons (no external dependency needed)
  const ChevronLeftIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12Z" />
    </svg>
  );

  const ChevronRightIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12Z" />
    </svg>
  );

  const handleTabChange = (_, newValue) => setTab(newValue);

  // Touch handlers for swipe functionality
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && tab < 3) {
      setTab(tab + 1);
    }
    if (isRightSwipe && tab > 0) {
      setTab(tab - 1);
    }
  };

  // Navigation functions
  const goToPrevTab = () => {
    if (tab > 0) setTab(tab - 1);
  };

  const goToNextTab = () => {
    if (tab < 3) setTab(tab + 1);
  };

  // Helper function to safely get nested values
  const getSafeValue = (path, fallback = "N/A") => {
    try {
      return path || fallback;
    } catch (error) {
      console.warn("Error accessing path:", error);
      return fallback;
    }
  };

  // Tab Panel Component with swipe support
  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`player-tabpanel-${index}`}
        aria-labelledby={`player-tab-${index}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...other}
      >
        {value === index && (
          <Box 
            p={1} 
            sx={{
              minHeight: isMobile ? "120px" : "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            {children}
          </Box>
        )}
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : "16px",
          padding: isMobile ? "10px" : "20px",
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(34, 197, 94, 0.2)",
          overflow: "hidden",
          position: "relative",
          height: isMobile ? "78vh" : "auto",
        //   width: isMobile ? "95vw" : "auto",
        },
      }}
    >
      {/* Gradient top border */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #22c55e, #3b82f6, #8b5cf6, #22c55e)",
        }}
      />

      {/* Player Info */}
      <DialogTitle sx={{ textAlign: "center", pb: 1, pt: isMobile ? 3 : 2 }}>
        <Avatar
          src={profilePhoto}
          alt={playerName}
          sx={{
            width: isMobile ? 100 : 80,
            height: isMobile ? 100 : 80,
            margin: "0 auto",
            mb: 1,
            border: "2px solid #22c55e",
            boxShadow: "0 0 15px rgba(34, 197, 94, 0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)",
            },
          }}
        />
        <Typography
          variant={isMobile ? "h5" : "h6"}
          fontWeight="700"
          sx={{
            background: "linear-gradient(135deg, #22c55e, #3b82f6)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 10px rgba(34, 197, 94, 0.3)",
          }}
        >
          {playerName}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 0, pb: isMobile ? 2 : 1 }}>
        {/* Mobile Tab Navigation with Swipe Indicator */}
        {isMobile && (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: "rgba(148, 163, 184, 0.6)",
                fontSize: "0.75rem"
              }}
            >
              ← Swipe to navigate or use arrows →
            </Typography>
          </Box>
        )}

        {/* Tab Header with Navigation */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          mb: 2,
          borderBottom: "1px solid rgba(34, 197, 94, 0.2)",
        }}>
          {/* Previous Tab Button - Mobile Only */}
          {isMobile && (
            <IconButton 
              onClick={goToPrevTab} 
              disabled={tab === 0}
              sx={{ 
                color: tab === 0 ? "rgba(148, 163, 184, 0.3)" : "#22c55e",
                "&:disabled": { color: "rgba(148, 163, 184, 0.3)" }
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          )}

          {/* Tabs */}
          {isMobile ? (
            // Mobile: Show current tab only
            <Box sx={{ flex: 1, textAlign: "center", py: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: "#22c55e",
                  fontWeight: 600,
                  textShadow: "0 0 8px rgba(34, 197, 94, 0.4)"
                }}
              >
                {tabNames[tab]}
              </Typography>
              {/* Tab Dots Indicator */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, mt: 1 }}>
                {tabNames.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: index === tab ? "#22c55e" : "rgba(148, 163, 184, 0.3)",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </Box>
            </Box>
          ) : (
            // Desktop/Tablet: Show all tabs
            <Tabs
              value={tab}
              onChange={handleTabChange}
              centered={!isTablet}
              variant={isTablet ? "scrollable" : "standard"}
              scrollButtons="auto"
              textColor="inherit"
              sx={{
                flex: 1,
                "& .MuiTab-root": {
                  color: "rgba(148, 163, 184, 0.8)",
                  fontWeight: 600,
                  fontSize: isTablet ? "0.8rem" : "0.875rem",
                  minWidth: isTablet ? 80 : 120,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: "#22c55e",
                  },
                },
                "& .Mui-selected": {
                  color: "#22c55e !important",
                  textShadow: "0 0 8px rgba(34, 197, 94, 0.4)",
                },
                "& .MuiTabs-indicator": {
                  background: "linear-gradient(90deg, #22c55e, #3b82f6)",
                  height: "3px",
                  borderRadius: "2px",
                },
              }}
            >
              <Tab label="Batting" />
              <Tab label="Bowling" />
              <Tab label="Fielding" />
              <Tab label="MVP" />
            </Tabs>
          )}

          {/* Next Tab Button - Mobile Only */}
          {isMobile && (
            <IconButton 
              onClick={goToNextTab} 
              disabled={tab === 3}
              sx={{ 
                color: tab === 3 ? "rgba(148, 163, 184, 0.3)" : "#22c55e",
                "&:disabled": { color: "rgba(148, 163, 184, 0.3)" }
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          )}
        </Box>

        {/* Tab Panels */}
        <Box sx={{ minHeight: isMobile ? "300px" : "200px" }}>
          <TabPanel value={tab} index={0}>
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ 
                  color: "#22c55e", 
                  fontWeight: 600, 
                  mb: 0.5,
                  fontSize: isMobile ? "1rem" : "0.875rem"
                }}>
                  Runs:
                </Typography>
                <Typography sx={{ 
                  color: "#fff", 
                  fontSize: isMobile ? "2rem" : "24px", 
                  fontWeight: 700 
                }}>
                  {getSafeValue(stats?.batting?.runs)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ 
                  color: "#22c55e", 
                  fontWeight: 600, 
                  mb: 0.5,
                  fontSize: isMobile ? "1rem" : "0.875rem"
                }}>
                  Strike Rate:
                </Typography>
                <Typography sx={{ 
                  color: "#fff", 
                  fontSize: isMobile ? "2rem" : "24px", 
                  fontWeight: 700 
                }}>
                  {getSafeValue(stats?.batting?.strikeRate)}
                </Typography>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ 
                  color: "#22c55e", 
                  fontWeight: 600, 
                  mb: 0.5,
                  fontSize: isMobile ? "1rem" : "0.875rem"
                }}>
                  Wickets:
                </Typography>
                <Typography sx={{ 
                  color: "#fff", 
                  fontSize: isMobile ? "2rem" : "24px", 
                  fontWeight: 700 
                }}>
                  {getSafeValue(stats?.bowling?.wickets)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ 
                  color: "#22c55e", 
                  fontWeight: 600, 
                  mb: 0.5,
                  fontSize: isMobile ? "1rem" : "0.875rem"
                }}>
                  Economy:
                </Typography>
                <Typography sx={{ 
                  color: "#fff", 
                  fontSize: isMobile ? "2rem" : "24px", 
                  fontWeight: 700 
                }}>
                  {getSafeValue(stats?.bowling?.economy)}
                </Typography>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ 
                  color: "#22c55e", 
                  fontWeight: 600, 
                  mb: 0.5,
                  fontSize: isMobile ? "1rem" : "0.875rem"
                }}>
                  Catches:
                </Typography>
                <Typography sx={{ 
                  color: "#fff", 
                  fontSize: isMobile ? "2rem" : "24px", 
                  fontWeight: 700 
                }}>
                  {getSafeValue(stats?.fielding?.catches)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ 
                  color: "#22c55e", 
                  fontWeight: 600, 
                  mb: 0.5,
                  fontSize: isMobile ? "1rem" : "0.875rem"
                }}>
                  Run Outs:
                </Typography>
                <Typography sx={{ 
                  color: "#fff", 
                  fontSize: isMobile ? "2rem" : "24px", 
                  fontWeight: 700 
                }}>
                  {getSafeValue(stats?.fielding?.runOuts)}
                </Typography>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={3}>
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ 
                  color: "#22c55e", 
                  fontWeight: 600, 
                  mb: 0.5,
                  fontSize: isMobile ? "1rem" : "0.875rem"
                }}>
                  Average Points:
                </Typography>
                <Typography sx={{ 
                  color: "#fff", 
                  fontSize: isMobile ? "2rem" : "24px", 
                  fontWeight: 700 
                }}>
                  {getSafeValue(stats?.mvp?.avgPoints)}
                </Typography>
              </Box>
              {/* Additional MVP stats if available */}
              {stats?.mvp?.totalPoints && (
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ 
                    color: "#22c55e", 
                    fontWeight: 600, 
                    mb: 0.5,
                    fontSize: isMobile ? "1rem" : "0.875rem"
                  }}>
                    Total Points:
                  </Typography>
                  <Typography sx={{ 
                    color: "#fff", 
                    fontSize: isMobile ? "2rem" : "24px", 
                    fontWeight: 700 
                  }}>
                    {getSafeValue(stats?.mvp?.totalPoints)}
                  </Typography>
                </Box>
              )}
              {stats?.mvp?.rank && (
                <Box>
                  <Typography sx={{ 
                    color: "#22c55e", 
                    fontWeight: 600, 
                    mb: 0.5,
                    fontSize: isMobile ? "1rem" : "0.875rem"
                  }}>
                    Rank:
                  </Typography>
                  <Typography sx={{ 
                    color: "#fff", 
                    fontSize: isMobile ? "2rem" : "24px", 
                    fontWeight: 700 
                  }}>
                    #{getSafeValue(stats?.mvp?.rank)}
                  </Typography>
                </Box>
              )}
            </Box>
          </TabPanel>
        </Box>
      </DialogContent>
    </Dialog>
  );
}