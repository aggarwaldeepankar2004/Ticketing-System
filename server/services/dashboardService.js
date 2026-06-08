import { fn, col, Op } from 'sequelize';
import { ActivityLog, Ticket, User } from '../models/index.js';

export const getDashboardAnalytics = async () => {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const closedStatuses = ['Resolved', 'Closed'];

  const [
    totalTickets,
    openTickets,
    closedTickets,
    criticalTickets,
    overdueTickets,
    dueSoonTickets,
    unassignedTickets,
    statusBreakdown,
    priorityBreakdown,
    assigneeBreakdown,
    departmentBreakdown,
    recentTickets,
    recentActivity,
  ] =
    await Promise.all([
      Ticket.count(),
      Ticket.count({ where: { status: 'Open' } }),
      Ticket.count({ where: { status: 'Closed' } }),
      Ticket.count({ where: { priority: 'Critical' } }),
      Ticket.count({
        where: {
          dueDate: { [Op.lt]: now },
          status: { [Op.notIn]: closedStatuses },
        },
      }),
      Ticket.count({
        where: {
          dueDate: { [Op.between]: [now, sevenDaysFromNow] },
          status: { [Op.notIn]: closedStatuses },
        },
      }),
      Ticket.count({ where: { assignedToId: null } }),
      Ticket.findAll({
        attributes: ['status', [fn('COUNT', col('Ticket.id')), 'count']],
        group: ['status'],
        raw: true,
      }),
      Ticket.findAll({
        attributes: ['priority', [fn('COUNT', col('Ticket.id')), 'count']],
        group: ['priority'],
        raw: true,
      }),
      Ticket.findAll({
        attributes: ['assignedToId', [fn('COUNT', col('Ticket.id')), 'count']],
        include: [{ model: User, as: 'assignedTo', attributes: ['id', 'name', 'role'] }],
        group: ['assignedToId', 'assignedTo.id'],
        raw: true,
        nest: true,
      }),
      Ticket.findAll({
        attributes: [[fn('COUNT', col('Ticket.id')), 'count']],
        include: [{ model: User, as: 'createdBy', attributes: ['department'] }],
        group: ['createdBy.department'],
        raw: true,
        nest: true,
      }),
      Ticket.findAll({
        limit: 6,
        order: [['updatedAt', 'DESC']],
        include: [
          { model: User, as: 'createdBy', attributes: ['id', 'name', 'department'] },
          { model: User, as: 'assignedTo', attributes: ['id', 'name', 'role'] },
        ],
      }),
      ActivityLog.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [
          { model: User, as: 'actor', attributes: ['id', 'name', 'role'] },
          { model: Ticket, as: 'ticket', attributes: ['id', 'title'] },
        ],
      }),
    ]);

  const resolvedCount = statusBreakdown
    .filter((item) => closedStatuses.includes(item.status))
    .reduce((sum, item) => sum + Number(item.count), 0);
  const activeCount = Math.max(totalTickets - resolvedCount, 0);
  const completionRate = totalTickets ? Math.round((resolvedCount / totalTickets) * 100) : 0;

  return {
    totals: {
      totalTickets,
      openTickets,
      closedTickets,
      criticalTickets,
      overdueTickets,
      dueSoonTickets,
      unassignedTickets,
      activeTickets: activeCount,
      completionRate,
    },
    statusBreakdown: statusBreakdown.map((item) => ({ name: item.status, tickets: Number(item.count) })),
    priorityBreakdown: priorityBreakdown.map((item) => ({ name: item.priority, tickets: Number(item.count) })),
    assigneeBreakdown: assigneeBreakdown.map((item) => ({
      name: item.assignedTo?.name || 'Unassigned',
      role: item.assignedTo?.role || 'Queue',
      tickets: Number(item.count),
    })),
    departmentBreakdown: departmentBreakdown.map((item) => ({
      name: item.createdBy?.department || 'No department',
      tickets: Number(item.count),
    })),
    resolutionOverview: [
      { name: 'Active', tickets: activeCount },
      { name: 'Resolved/Closed', tickets: resolvedCount },
    ],
    recentTickets,
    recentActivity,
  };
};
