import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize, User, Ticket, Comment, Attachment, ActivityLog } from '../models/index.js';
import { ACTIVITY_TYPES, ROLES } from '../utils/constants.js';

const demoPassword = 'Demo@12345';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.resolve(__dirname, '..', 'uploads');

const users = [
  { name: 'Aditi Sharma', email: 'admin@ticketdesk.com', role: ROLES.ADMIN, department: 'IT Operations' },
  { name: 'Rahul Mehta', email: 'manager@ticketdesk.com', role: ROLES.MANAGER, department: 'Service Desk' },
  { name: 'Priya Nair', email: 'agent@ticketdesk.com', role: ROLES.SUPPORT_AGENT, department: 'Support' },
  { name: 'Kabir Singh', email: 'employee@ticketdesk.com', role: ROLES.EMPLOYEE, department: 'Finance' },
  { name: 'Neha Kapoor', email: 'neha.employee@ticketdesk.com', role: ROLES.EMPLOYEE, department: 'HR' },
];

const ticketSeed = [
  {
    title: 'VPN access fails after password reset',
    description: 'Employee is unable to connect to VPN after resetting the domain password this morning.',
    status: 'Open',
    priority: 'High',
    creatorEmail: 'employee@ticketdesk.com',
    assigneeEmail: 'agent@ticketdesk.com',
  },
  {
    title: 'Payroll export report timing out',
    description: 'Finance payroll export fails after 60 seconds when selecting the current month.',
    status: 'In Progress',
    priority: 'Critical',
    creatorEmail: 'employee@ticketdesk.com',
    assigneeEmail: 'agent@ticketdesk.com',
  },
  {
    title: 'New employee laptop setup',
    description: 'Prepare laptop, install standard software, and configure email for new HR employee.',
    status: 'Pending',
    priority: 'Medium',
    creatorEmail: 'neha.employee@ticketdesk.com',
    assigneeEmail: 'manager@ticketdesk.com',
  },
  {
    title: 'Printer queue stuck on third floor',
    description: 'Shared printer queue is not clearing jobs for users on the third floor.',
    status: 'Resolved',
    priority: 'Low',
    creatorEmail: 'neha.employee@ticketdesk.com',
    assigneeEmail: 'agent@ticketdesk.com',
  },
  {
    title: 'Email delivery delay for external domains',
    description: 'Outbound emails to customer domains are delayed by 20 to 30 minutes.',
    status: 'Reopened',
    priority: 'High',
    creatorEmail: 'manager@ticketdesk.com',
    assigneeEmail: 'agent@ticketdesk.com',
  },
];

const seed = async () => {
  await sequelize.authenticate();
  await sequelize.sync();

  await sequelize.transaction(async (transaction) => {
    await ActivityLog.destroy({ where: {}, transaction });
    await Attachment.destroy({ where: {}, transaction });
    await Comment.destroy({ where: {}, transaction });
    await Ticket.destroy({ where: {}, transaction });
    await User.destroy({ where: {}, transaction });

    const createdUsers = {};

    for (const user of users) {
      const created = await User.create({ ...user, password: demoPassword }, { transaction });
      createdUsers[user.email] = created;
    }

    for (const ticketData of ticketSeed) {
      const ticket = await Ticket.create(
        {
          title: ticketData.title,
          description: ticketData.description,
          status: ticketData.status,
          priority: ticketData.priority,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
          createdById: createdUsers[ticketData.creatorEmail].id,
          assignedToId: createdUsers[ticketData.assigneeEmail].id,
        },
        { transaction },
      );

      await Comment.bulkCreate(
        [
          {
            body: 'Ticket reviewed and initial triage completed.',
            ticketId: ticket.id,
            userId: createdUsers[ticketData.assigneeEmail].id,
          },
          {
            body: 'Thanks, please keep me updated when there is progress.',
            ticketId: ticket.id,
            userId: createdUsers[ticketData.creatorEmail].id,
          },
        ],
        { transaction },
      );

      await Attachment.create(
        {
          originalName: 'demo-note.txt',
          storedName: `demo-ticket-${ticket.id}-note.txt`,
          mimeType: 'text/plain',
          size: 120,
          path: `uploads/demo-ticket-${ticket.id}-note.txt`,
          ticketId: ticket.id,
          uploadedById: createdUsers[ticketData.creatorEmail].id,
        },
        { transaction },
      );

      await ActivityLog.bulkCreate(
        [
          {
            action: ACTIVITY_TYPES.TICKET_CREATED,
            metadata: { title: ticket.title },
            ticketId: ticket.id,
            actorId: createdUsers[ticketData.creatorEmail].id,
          },
          {
            action: ACTIVITY_TYPES.TICKET_ASSIGNED,
            metadata: { assignedTo: createdUsers[ticketData.assigneeEmail].name },
            ticketId: ticket.id,
            actorId: createdUsers['manager@ticketdesk.com'].id,
          },
          {
            action: ACTIVITY_TYPES.COMMENT_ADDED,
            metadata: { comment: 'Ticket reviewed and initial triage completed.' },
            ticketId: ticket.id,
            actorId: createdUsers[ticketData.assigneeEmail].id,
          },
        ],
        { transaction },
      );
    }
  });

  fs.mkdirSync(uploadRoot, { recursive: true });
  const tickets = await Ticket.findAll({ attributes: ['id', 'title'] });
  tickets.forEach((ticket) => {
    fs.writeFileSync(
      path.join(uploadRoot, `demo-ticket-${ticket.id}-note.txt`),
      `Demo attachment for ticket #${ticket.id}: ${ticket.title}\n`,
    );
  });

  console.log('Demo data seeded successfully.');
  console.log('Login with any demo account using password: Demo@12345');
  console.log('Admin: admin@ticketdesk.com');
  console.log('Manager: manager@ticketdesk.com');
  console.log('Support Agent: agent@ticketdesk.com');
  console.log('Employee: employee@ticketdesk.com');

  await sequelize.close();
};

seed().catch(async (error) => {
  console.error('Failed to seed demo data:', error);
  await sequelize.close();
  process.exit(1);
});
