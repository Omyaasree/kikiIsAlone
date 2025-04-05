// "use client"

// import { useState, useEffect } from "react"
// import Box from "@mui/material/Box"
// import Checkbox from "@mui/material/Checkbox"
// import Button from "@mui/material/Button"
// import Typography from "@mui/material/Typography"
// import List from "@mui/material/List"
// import ListItem from "@mui/material/ListItem"
// import ListItemText from "@mui/material/ListItemText"
// import ListItemIcon from "@mui/material/ListItemIcon"
// import Container from "@mui/material/Container"
// import AddCircleIcon from "@mui/icons-material/AddCircle"
// import { ThemeProvider, createTheme } from "@mui/material/styles"
// import CssBaseline from '@mui/material/CssBaseline';

// // Import Firebase
// import { firestore } from "../firebase";
// import { collection, getDocs, query } from "firebase/firestore";

// // Create a theme instance
// const theme = createTheme({
//   palette: {
//     mode: "light",
//     primary: {
//       main: "#000000",
//     },
//     secondary: {
//       main: "#f50057",
//     },
//   },
// })

// export default function ContactsPage() {
//   const [contacts, setContacts] = useState([])
  
//   // Fetch contacts from Firebase when component mounts
//   useEffect(() => {
//     async function fetchContacts() {
//       const contactsRef = collection(firestore, 'contacts')
        
//       const querySnapshot = await getDocs(query(contactsRef))
        
//       // Transform Firebase documents to match  app's structure
//       const contactsList = []
//       let counter = 1
        
//       querySnapshot.forEach((doc) => {
//         contactsList.push({
//           id: counter.toString(),
//           name: doc.id, 
//           phone: doc.data().phone ,
//           checked: true // Default checked state
//         })
          
//         counter++
//       })
//       setContacts(contactsList)
//     }
    
//     fetchContacts()
//   }, [])
  
//   const handleCheckboxChange = (id) => {
//     setContacts(contacts.map((contact) => (
//       contact.id === id ? { ...contact, checked: !contact.checked } : contact
//     )))
//   }

//   const addToPhoneContacts = async (contact) => {
//     // check whether the browser supports contacts api
//     if ("contacts" in navigator && "ContactsManager" in window) {
//       try {
//         const props = ["name", "tel"]
//         //const opts = { multiple: false }
        
//         const contacts = await navigator.contacts.select(props)//, opts)
//         console.log("Selected contacts:", contacts)
        
        
//         // Note: The current Contact API is primarily for reading contacts
//         // Adding contacts is not fully supported across browsers
        
        
//         // For demonstration, we'll create a vCard file for download
//         createVCardFile(contact)
//       } catch (error) {
//         createVCardFile(contact)
//       }
//     } else {
//       // Fallback to vCard download for unsupported browsers
//       createVCardFile(contact)
//     }
//   }

//   const createVCardFile = (contact) => {
//     // Create a vCard format text
//     const vCard = BEGIN:VCARD
//     VERSION:3.0
//     FN:${contact.name}
//     TEL;TYPE=CELL:${contact.phone}
//     END:VCARD
    
//     // Create a blob and download link
//     const blob = new Blob([vCard], { type: "text/vcard" })
//     const url = URL.createObjectURL(blob)
    
//     const link = document.createElement("a")
//     link.href = url
//     link.download = ${contact.name}.vcf
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }
    
  
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Container maxWidth="md" sx={{ py: 4 }}>
//         <Typography variant="h5" align="center">Important Contacts</Typography>
        
//         {contacts.length === 0 ? (
//           <Typography align="center" sx={{ mt: 2 }}>No contacts found</Typography>
//         ) : (
//           <List>
//             {contacts.map((contact) => (
//               <ListItem onClick={() => handleCheckboxChange(contact.id)} key={contact.id}>
//                 <ListItemIcon>
//                   <Checkbox edge="start" checked={contact.checked} tabIndex={-1} disableRipple />
//                 </ListItemIcon>
//                 <ListItemText primary={contact.name} secondary={contact.phone} />  
//               </ListItem>
//             ))}
//           </List>
//         )}
  
//         <Box sx={{ mt: 4 }}>
//           <Button
//             variant="contained"
//             fullWidth
//             startIcon={<AddCircleIcon />}
//             onClick={addToPhoneContacts}
//           >
//             Add to Contacts
//           </Button>
//         </Box>
//       </Container>
//     </ThemeProvider>
//   );
// }

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
    mode: "light",
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
  
  const addToPhoneContacts = async () => {
    const selectedContacts = contacts.filter(contact => contact.checked);
  
    if (selectedContacts.length === 0) {
      setSnackbar({
        open: true,
        message: "No contacts selected.",
        severity: "warning"
      });
      return;
    }
  
    if ("contacts" in navigator && "ContactsManager" in window) {
      try {
        // Even though writing is not supported, fallback anyway
        console.log("Contact Picker API is supported, but writing isn't. Falling back.");
        createVCardFile(selectedContacts);
      } catch (error) {
        console.error("Error with Contact Picker API:", error);
        createVCardFile(selectedContacts);
      }
    } else {
      // Fallback to vCard creation
      createVCardFile(selectedContacts);
    }
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
          onClick={addToPhoneContacts}
        >
          Add to Contacts
        </Button>

        </Box>
        
        
      </Container>
    </ThemeProvider>
  );
}