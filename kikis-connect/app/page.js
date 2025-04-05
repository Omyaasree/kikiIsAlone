"use client"

import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Checkbox from "@mui/material/Checkbox"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import ListItemIcon from "@mui/material/ListItemIcon"
import Container from "@mui/material/Container"
import AddCircleIcon from "@mui/icons-material/AddCircle"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from '@mui/material/CssBaseline'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

// Import Firebase
import { firestore } from "../firebase";
import { collection, getDocs, query } from "firebase/firestore";

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#f50057",
    },
  },
})

export default function ContactsPage() {
  const [contacts, setContacts] = useState([])
  
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
      } catch (error) {
        console.log("Contacts API error:", error)
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
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" align="center">Important Contacts</Typography>
        
        {contacts.length === 0 ? (
          <Typography align="center" sx={{ mt: 2 }}>No contacts found</Typography>
        ) : (
          <List>
            {contacts.map((contact) => (
              <ListItem onClick={() => handleCheckboxChange(contact.id)} key={contact.id}>
                <ListItemIcon>
                  <Checkbox edge="start" checked={contact.checked} tabIndex={-1} disableRipple />
                </ListItemIcon>
                <ListItemText primary={contact.name} secondary={contact.phone} /> 
              </ListItem>
            ))}
          </List>
        )}
        
        <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddCircleIcon />}
          onClick={() => addToPhoneContacts(contacts.filter(c => c.checked))}
          >
          Add to Contacts
        </Button>

        </Box>
        
        
      </Container>
    </ThemeProvider>
  );
}