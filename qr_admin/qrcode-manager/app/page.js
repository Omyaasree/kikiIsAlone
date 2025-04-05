"use client";

import { useState, useEffect } from 'react';
import {
  Box, Stack, Typography, Button, Modal, TextField,
  Container, Paper, InputAdornment, IconButton, Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { firestore } from '../firebase';
import {
  collection, doc, getDocs, setDoc, deleteDoc, query
} from 'firebase/firestore';

const colors = {
  dark: "#F7B800",          // USF Green
  light: "#FFFFFF",         // White
  accent: "#006747",        // USF Gold
  finder_dark: "#F7B800",   // USF Gold
  finder_light: "#FFFFFF",  // White
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: colors.light,
  border: `2px solid ${colors.dark}`,
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  borderRadius: '8px',
  color: colors.dark
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
  const [phoneError, setPhoneError] = useState('');

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
      setEditMode(true);
      setCurrentContactName(contact.name);
      setName(contact.name);
      setPhone(contact.phone);
      setPhoneError('');
    } else {
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
    const rawPhone = phone.replace(/\D/g, '');

    if (!/^\d{10}$/.test(rawPhone)) {
      setPhoneError('Phone number must be a valid 10-digit number.');
      return;
    }

    const formattedPhoneNumber = `(${rawPhone.slice(0, 3)}) ${rawPhone.slice(3, 6)}-${rawPhone.slice(6)}`;

    try {
      if (editMode && currentContactName !== name) {
        await deleteDoc(doc(firestore, "contacts", currentContactName));
        await setDoc(doc(firestore, "contacts", name), { phone: formattedPhoneNumber });
      } else {
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
    <Container maxWidth="md" sx={{ bgcolor: colors.light, py: 4, minHeight: '100vh' }}>
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={3}
      >
        <Typography variant="h3" sx={{ color: colors.dark, fontWeight: 'bold', textAlign: 'center' }}>
          Admin
        </Typography>

        <TextField
          label="Search contacts"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ bgcolor: colors.finder_light }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.dark }} />
              </InputAdornment>
            ),
          }}
        />

        <Paper
          elevation={3}
          sx={{
            width: '100%',
            borderRadius: '8px',
            overflow: 'hidden',
            border: `1px solid ${colors.dark}`,
            bgcolor: colors.dark
          }}
        >
          <Stack
            width="100%"
            maxHeight="500px"
            spacing={0}
            overflow="auto"
            divider={<Box sx={{ borderBottom: `1px solid ${colors.dark}` }} />}
          >
            {filteredContacts.length === 0 ? (
              <Box py={4} display="flex" justifyContent="center" alignItems="center">
                <Typography variant="body1" sx={{ color: colors.dark }}>
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
                  sx={{
                    bgcolor: colors.light,
                    '&:hover': { bgcolor: '#f0ece4' }
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ color: colors.dark, fontWeight: 500 }}>
                      {contact.name}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      {contact.phone}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton color="primary" onClick={() => handleOpen(contact)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton sx={{ color: colors.finder_dark }} onClick={() => openDeleteConfirmation(contact.name)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Box>
              ))
            )}
          </Stack>
        </Paper>
      </Box>

      <Fab
        sx={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          bgcolor: colors.finder_dark,
          color: colors.light,
          '&:hover': { bgcolor: '#c0392b' }
        }}
        aria-label="add"
        onClick={() => handleOpen()}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6">
            {editMode ? 'Edit Contact' : 'Add New Contact'}
          </Typography>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            type="text"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setPhoneError('');
            }}
            error={!!phoneError}
            helperText={phoneError}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" sx={{ bgcolor: colors.dark }} onClick={saveContact}>
              {editMode ? 'Update' : 'Add'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteConfirmOpen} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6">Delete Contact</Typography>
          <Typography variant="body1">
            Are you sure you want to delete this contact? This action cannot be undone.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" sx={{ bgcolor: colors.finder_dark }} onClick={deleteContact}>
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Container>
  );
}
