"use client"

// https://adminkiki.vercel.app/ this is the URL

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, Container, Paper, InputAdornment, IconButton, Fab } from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { firestore } from '../firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, getDoc, query } from 'firebase/firestore';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #ddd',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  borderRadius: '8px'
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentContactName, setCurrentContactName] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [phoneError, setPhoneError] = useState('');  // State for phone number error

  // Fetch contacts from Firebase
  useEffect(() => {
    updateContacts();
  }, []);

  const updateContacts = async () => {
    try {
      const snapshot = query(collection(firestore, 'contacts'));
      const docs = await getDocs(snapshot);
      const contactsList = [];
      docs.forEach((document) => {
        contactsList.push({ 
          name: document.id, 
          phone: document.data().phone 
        });
      });
      setContacts(contactsList);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpen = (contact = null) => {
    if (contact) {
      // Edit mode
      setEditMode(true);
      setCurrentContactName(contact.name);
      setName(contact.name);
      setPhone(contact.phone);
      setPhoneError('');
    } else {
      // Add mode
      setEditMode(false);
      setCurrentContactName(null);
      setName('');
      setPhone('');
      setPhoneError('');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDeleteConfirmOpen(false);
  };

  const openDeleteConfirmation = (contactName) => {
    setCurrentContactName(contactName);
    setDeleteConfirmOpen(true);
  };

  const saveContact = async () => {
    // Remove non-numeric characters
    const rawPhone = phone.replace(/\D/g, '');

    // Check if the phone number is numeric and has exactly 10 digits
    if (!/^\d{10}$/.test(rawPhone)) {
      setPhoneError('Phone number must be a valid 10-digit number.');
      return;
    }

    // Format the phone number as (XXX) XXX-XXXX
    const formattedPhoneNumber = `(${rawPhone.slice(0, 3)}) ${rawPhone.slice(3, 6)}-${rawPhone.slice(6)}`;

    try {
      if (editMode && currentContactName !== name) {
        // If name changed, delete old doc and create new one
        await deleteDoc(doc(firestore, "contacts", currentContactName));
        await setDoc(doc(firestore, "contacts", name), { phone: formattedPhoneNumber });
      } else if (editMode) {
        // Just update existing contact
        await setDoc(doc(firestore, "contacts", name), { phone: formattedPhoneNumber });
      } else {
        // Add new contact
        await setDoc(doc(firestore, "contacts", name), { phone: formattedPhoneNumber });
      }
      updateContacts();
      handleClose();
    } catch (error) {
      console.error("Error saving contact:", error);
    }
  };

  const deleteContact = async () => {
    try {
      await deleteDoc(doc(firestore, "contacts", currentContactName));
      updateContacts();
      handleClose();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        my={4}
        gap={3}
      >
        {/* Title */}
        <Typography variant="h3" color="#333" textAlign="center" fontWeight="bold">
          Contacts
        </Typography>

        {/* Search Bar */}
        <TextField
          label="Search contacts"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Contacts List */}
        <Paper 
          elevation={3}
          sx={{ 
            width: '100%', 
            borderRadius: '8px', 
            overflow: 'hidden',
            border: '1px solid #eee'
          }}
        >
          <Stack 
            width="100%" 
            maxHeight="500px" 
            spacing={0} 
            overflow="auto"
            divider={<Box sx={{ borderBottom: '1px solid #eee', width: '100%' }} />}
          >
            {filteredContacts.length === 0 ? (
              <Box 
                py={4} 
                display="flex" 
                justifyContent="center"
                alignItems="center"
              >
                <Typography variant="body1" color="#666">
                  {searchQuery ? 'No contacts match your search.' : 'No contacts found.'}
                </Typography>
              </Box>
            ) : (
              filteredContacts.map((contact) => (
                <Box
                  key={contact.name}
                  py={3}
                  px={4}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  bgcolor="white"
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <Box>
                    <Typography variant="h6" color="#333" fontWeight="500">
                      {contact.name}
                    </Typography>
                    <Typography variant="body1" color="#666">
                      {contact.phone}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton 
                      color="primary"
                      onClick={() => handleOpen(contact)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => openDeleteConfirmation(contact.name)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Box>
              ))
            )}
          </Stack>
        </Paper>
      </Box>
      
      {/* Add Button (floating in bottom right) */}
      <Fab 
        color="primary" 
        aria-label="add"
        onClick={() => handleOpen()}
        sx={{ 
          position: 'fixed', 
          bottom: 30, 
          right: 30 
        }}
      >
        <AddIcon />
      </Fab>
      
      {/* Add/Edit Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="contact-modal-title"
      >
        <Box sx={modalStyle}>
          <Typography id="contact-modal-title" variant="h6" component="h2">
            {editMode ? 'Edit Contact' : 'Add New Contact'}
          </Typography>
          
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            type="number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setPhoneError('');  // Clear error while typing
            }}
            error={!!phoneError}
            helperText={phoneError}
          />
          
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={saveContact}
            >
              {editMode ? 'Update' : 'Add'}
            </Button>
          </Stack>
        </Box>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirmOpen}
        onClose={handleClose}
        aria-labelledby="delete-modal-title"
      >
        <Box sx={modalStyle}>
          <Typography id="delete-modal-title" variant="h6" component="h2">
            Delete Contact
          </Typography>
          <Typography variant="body1">
            Are you sure you want to delete this contact? This action cannot be undone.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={deleteContact}>
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Container>
  );
}
