import { createTicket, deleteTicket, getTicketById, listTickets, updateTicket } from '../services/ticketService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getTickets = asyncHandler(async (req, res) => {
  const tickets = await listTickets(req.query, req.user);
  res.status(200).json({ success: true, data: { tickets } });
});

export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await getTicketById(req.params.id, req.user);
  res.status(200).json({ success: true, data: { ticket } });
});

export const storeTicket = asyncHandler(async (req, res) => {
  const ticket = await createTicket(req.body, req.user);
  res.status(201).json({ success: true, message: 'Ticket created successfully.', data: { ticket } });
});

export const patchTicket = asyncHandler(async (req, res) => {
  const ticket = await updateTicket(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, message: 'Ticket updated successfully.', data: { ticket } });
});

export const removeTicket = asyncHandler(async (req, res) => {
  await deleteTicket(req.params.id, req.user);
  res.status(200).json({ success: true, message: 'Ticket deleted successfully.' });
});
