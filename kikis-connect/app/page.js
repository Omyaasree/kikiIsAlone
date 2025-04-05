"use client"

import { useState, useEffect } from "react"
import { 
  Box, Avatar, Divider, Checkbox, Button, Typography, List, ListItem, 
  ListItemText, ListItemIcon, Container,
  Snackbar, Alert, Card, CardContent, createTheme, 
  ThemeProvider, CssBaseline
} from "@mui/material"
import {
  ContactPhone as ContactIcon,
  Contacts as ContactsIcon,
  AddCircle as AddCircleIcon,
  Check as CheckIcon,
  Info as InfoIcon
} from "@mui/icons-material"
import { deepPurple, blueGrey, teal } from '@mui/material/colors'

// Import Firebase
import { firestore } from "../firebase"
import { collection, getDocs, query } from "firebase/firestore"

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: deepPurple[700],
      light: deepPurple[500],
      dark: deepPurple[900]
    },
    secondary: {
      main: teal[600],
      light: teal[400],
      dark: teal[800]
    },
    background: {
      default: blueGrey[50],
      paper: '#ffffff'
    }
  }
})

export default function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  })
  
  // Get a random color for each contact's avatar
  const getAvatarColor = (name) => {
    return teal[600]
  }
  
  // Get initials from name
  const getInitials = (name) => {
    const exclude = ['of', 'the']
    return name
      .split(' ')
      .filter(word => !exclude.includes(word.toLowerCase()))
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  
  // Fetch contacts from Firebase when component mounts
  useEffect(() => {
    async function fetchContacts() {
      try {
        const contactsRef = collection(firestore, 'contacts')
        const querySnapshot = await getDocs(query(contactsRef))
        
        // Transform Firebase documents to match app's structure
        const contactsList = []
        let counter = 1
        
        querySnapshot.forEach((doc) => {
          // Get the phone number
          let phoneNumber = doc.data().phone || ""
          
          // Format phone for display if it's a 10-digit number
          let formattedPhone = phoneNumber
          if (phoneNumber.length === 10 && /^\d+$/.test(phoneNumber)) {
            formattedPhone = `(${phoneNumber.substring(0, 3)}) ${phoneNumber.substring(3, 6)}-${phoneNumber.substring(6)}`
          }
          
          contactsList.push({
            id: counter.toString(),
            name: doc.id,
            phone: formattedPhone, // Formatted for display
            rawPhone: phoneNumber, // Raw for adding to contacts
            checked: true // Default checked state
          })
          
          counter++
        })
        
        setContacts(contactsList)
      } catch (error) {
        console.error("Error fetching contacts:", error)
        setSnackbar({
          open: true,
          message: "Failed to load contacts. Please try again.",
          severity: "error"
        })
      }
    }
    
    fetchContacts()
  }, [])
  
  const handleCheckboxChange = (id) => {
    setContacts(contacts.map((contact) => (
      contact.id === id ? { ...contact, checked: !contact.checked } : contact
    )))
  }
  
  // Handle adding to phone contacts
  const addToPhoneContacts = async (selectedContacts) => {
    if (!selectedContacts || selectedContacts.length === 0) {
      setSnackbar({
        open: true,
        message: "No contacts selected.",
        severity: "warning"
      })
      return
    }

     // Try using Contacts API (not yet supported for writing on most browsers)
     if ("contacts" in navigator && "ContactsManager" in window) {
      try {
        const props = ["name", "tel"]
        await navigator.contacts.select(props)  // mostly for reading
        setSnackbar({
          open: true,
          message: "Contacts added successfully!",
          severity: "success"
        })
      } catch (error) {
        console.log("Contacts API error:", error)
        setSnackbar({
          open: true,
          message: "Error adding contacts: " + (error.message || "Please try again"),
          severity: "error"
        })
      }
    }

     // Fallback: Generate a single vCard with all selected contacts
     const vCards = selectedContacts.map((contact) => {
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${contact.name}`,  // Properly formatted with backticks
        `N:;${contact.name};;;`,  // This will put the full name in the First Name field
        `TEL;TYPE=CELL:${contact.rawPhone}`,
        "END:VCARD"
      ].join("\r\n");
    }).join("\r\n");
    
  
    const blob = new Blob([vCards], { type: "text/vcard" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "contacts.vcf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <Container maxWidth="md">
          <Card >
            {/* Header */}
            <Box
              sx={{
                p: 4,
                pb: 2,
                background: `linear-gradient(90deg, #2c3e50 0%,rgb(171, 53, 39) 50%, #fdf6e3 100%)`,
                color: "white",
                borderTopLeftRadius: theme.shape.borderRadius,
                borderTopRightRadius: theme.shape.borderRadius,
                position: "relative",
                overflow: "hidden"
              }}
            >
              
              
              <Box sx={{ position: "relative", zIndex: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <ContactsIcon fontSize="large" />
                  <Typography variant="h5" fontWeight="bold">
                    Important Contacts
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Select contacts to add to your phone
                </Typography>
              </Box>
            </Box>
            
            {/* Contacts List */}
            <CardContent sx={{ px: 0 }}>
              {contacts.length === 0 ? (
                <Box 
                  sx={{ 
                    py: 6, 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center",
                    gap: 2
                  }}
                >
                  <ContactIcon fontSize="large" color="disabled" />
                  <Typography color="text.secondary">
                    No contacts available
                  </Typography>
                </Box>
              ) : (
                <List sx={{ width: '100%' }}>
                  {contacts.map((contact) => (
                    <Box key={contact.id}>
                      <ListItem 
                        button 
                        onClick={() => handleCheckboxChange(contact.id)}
                        sx={{ 
                          py: 2,
                          px: 3,
                          transition: "all 0.2s",
                          "&:hover": { 
                            bgcolor: contact.checked ? 'rgba(103, 58, 183, 0.05)' : 'rgba(0, 0, 0, 0.02)' 
                          },
                          bgcolor: contact.checked ? 'rgba(103, 58, 183, 0.02)' : 'transparent'
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox 
                            edge="start" 
                            checked={contact.checked} 
                            sx={{ 
                              '& .MuiSvgIcon-root': { 
                                fontSize: 24,
                                color: contact.checked ? blueGrey[700] : undefined
                              } 
                            }}
                          />
                        </ListItemIcon>
                        
                        <Avatar 
                          sx={{ 
                            bgcolor: getAvatarColor(contact.name),
                            mr: 2,
                            width: 40,
                            height: 40,
                            fontSize: '1rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {getInitials(contact.name)}
                        </Avatar>
                        
                        <ListItemText 
                          primary={
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: contact.checked ? 600 : 500,
                                color: contact.checked ? blueGrey[900] : 'text.primary'
                              }}
                            >
                              {contact.name}
                            </Typography>
                          } 
                          secondary={
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Typography variant="body2" color="text.secondary">
                                {contact.phone}
                              </Typography>
                            </Box>
                          } 
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
            
            {/* Action Footer */}
            <Box sx={{ px: 3, mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => addToPhoneContacts(contacts.filter(c => c.checked))}
                sx={{ 
                  py: 1.5,
                  boxShadow: "0 4px 10px rgba(103, 58, 183, 0.2)",
                  position: "relative",
                  overflow: "hidden",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)",
                  },
                }}
              >
                Add to Phone Contacts
              </Button>
              
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  mt: 2, 
                  gap: 0.5
                }}
              >
                <InfoIcon fontSize="small" color="disabled" sx={{ fontSize: 16 }} />
                <Typography variant="caption" color="text.secondary">
                  Selected contacts will be added to your device
                </Typography>
              </Box>
            </Box>
          </Card>
        </Container>
      </Box>
      
      {/* Notification Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%', 
            borderRadius: 2,
            alignItems: 'center'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}