"use client";

import { useState, useEffect } from "react";
import { isPasscode } from "../lib/validate";
import { filterPasscode } from "../lib/filter";
import { Conference, ConferenceResponse } from "./types/conference";
import RegistrationStart from "./registration/RegistrationStart";
import {
  Box,
  Container,
  Typography,
  TextField,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';

export default function Home() {
  const [passcode, setPasscode] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [conference, setConference] = useState<Conference | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatDateToISO8601Local = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Convert to local timezone and format as ISO8601 without timezone info
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Check for passcode in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlPasscode = urlParams.get('passcode');
    
    if (urlPasscode) {
      // Filter and validate the URL passcode
      const filteredValue = filterPasscode(urlPasscode)
      setPasscode(filteredValue);

      
      // Validate the passcode
      const valid = isPasscode(filteredValue);
      setIsValid(valid);
      
      // If passcode is valid, fetch conference data
      if (valid) {
        fetchConference(filteredValue);
      }
    }
  }, []);

  const fetchConference = async (passcodeValue: string) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`http://localhost:1337/api/conferences?filters[passcode][$eq]=${passcodeValue}&populate=logo`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch conference data');
      }
      
      const data: ConferenceResponse = await response.json();
      setConference(data.data[0] || null);
      console.log('Conference data:', data.data[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching conference:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filteredValue = filterPasscode(e.target.value);
    setPasscode(filteredValue);
    const valid = isPasscode(filteredValue);
    setIsValid(valid);
    
    // Clear previous conference data when passcode changes
    setConference(null);
    setError("");
    
    // If passcode is valid, fetch conference data
    if (valid) {
      fetchConference(filteredValue);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '100vh',
            py: { xs: 8, md: 16 },
            px: { xs: 2, md: 8 },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            fontWeight="bold" 
            sx={{ 
              mb: 4, 
              fontSize: { xs: '2rem', md: '3rem', lg: '4rem' },
              lineHeight: 1.2 
            }}
          >
            Unified Event Solutions
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: 'md' }}>
            <Typography 
              variant="h6" 
              component="h6" 
              fontWeight="600"
              sx={{ 
                maxWidth: '400px',
                lineHeight: 1.3
              }}
            >
              Enter Passcode to get started.
            </Typography>
            
            <Box sx={{ width: '100%', maxWidth: '400px' }}>
              <TextField
                fullWidth
                value={passcode}
                onChange={handlePasscodeChange}
                placeholder="Enter 6-letter passcode"
                inputProps={{ maxLength: 6 }}
                color={
                  passcode.length === 0 
                    ? 'primary'
                    : isValid 
                      ? 'success' 
                      : 'error'
                }
                error={passcode.length > 0 && !isValid}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: passcode.length === 0 
                        ? 'primary.main'
                        : isValid 
                          ? 'success.main' 
                          : 'error.main'
                    }
                  }
                }}
              />
              
              {passcode.length > 0 && !isValid && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  Passcode must be exactly 6 letters (a-z)
                </Alert>
              )}
              
              {passcode.length > 0 && isValid && (
                <Box sx={{ mt: 1 }}>
                  {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="primary">
                        Loading conference data...
                      </Typography>
                    </Box>
                  )}
                  {error && (
                    <Alert severity="error">
                      Conference Not Found. Check passcode and try again.
                    </Alert>
                  )}
                  {conference && <RegistrationStart conference={conference} />}
                </Box>
              )}
            </Box>
          </Box>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Don't have a passcode?{' '}
              <Link href="/faq" underline="hover" fontWeight="medium">
                Check our FAQ
              </Link>
              {' '}for help getting started.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
