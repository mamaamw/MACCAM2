import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer un utilisateur admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@maccam.com' },
    update: {},
    create: {
      email: 'admin@maccam.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'MACCAM',
      phone: '+33 1 23 45 67 89',
      role: 'ADMIN',
      isActive: true
    }
  });

  console.log('✅ Utilisateur admin créé:', admin.email);

  // Créer un utilisateur manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@maccam.com' },
    update: {},
    create: {
      email: 'manager@maccam.com',
      username: 'manager',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '+33 1 23 45 67 90',
      role: 'MANAGER',
      isActive: true
    }
  });

  console.log('✅ Utilisateur manager créé:', manager.email);

  // Créer des paramètres système
  const settings = [
    { key: 'company_name', value: 'MACCAM CRM', type: 'string', category: 'general', description: 'Nom de l\'entreprise' },
    { key: 'company_email', value: 'contact@maccam.com', type: 'string', category: 'general', description: 'Email de l\'entreprise' },
    { key: 'currency', value: 'EUR', type: 'string', category: 'finance', description: 'Devise par défaut' },
    { key: 'tax_rate', value: '20', type: 'number', category: 'finance', description: 'Taux de TVA (%)' },
    { key: 'items_per_page', value: '20', type: 'number', category: 'general', description: 'Éléments par page' }
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    });
  }

  console.log('✅ Paramètres système créés');

  // Créer des clients d'exemple
  const customer1 = await prisma.customer.create({
    data: {
      companyName: 'TechCorp SA',
      contactName: 'Marie Martin',
      email: 'contact@techcorp.fr',
      phone: '+33 1 44 55 66 77',
      website: 'https://techcorp.fr',
      address: '123 Avenue des Champs',
      city: 'Paris',
      country: 'France',
      zipCode: '75008',
      isActive: true
    }
  });

  console.log('✅ Client créé:', customer1.companyName);

  // Créer un lead d'exemple
  const lead1 = await prisma.lead.create({
    data: {
      title: 'Nouveau site web e-commerce',
      description: 'Développement d\'une plateforme e-commerce complète',
      companyName: 'Fashion Store',
      contactName: 'Sophie Laurent',
      email: 'sophie@fashionstore.fr',
      phone: '+33 1 55 66 77 88',
      value: 25000,
      status: 'QUALIFIED',
      source: 'Website',
      assignedToId: manager.id
    }
  });

  console.log('✅ Lead créé:', lead1.title);

  // Créer un projet d'exemple
  const project1 = await prisma.project.create({
    data: {
      name: 'Refonte site web TechCorp',
      description: 'Modernisation complète du site web corporate',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +90 jours
      budget: 35000,
      status: 'IN_PROGRESS',
      progress: 35,
      customerId: customer1.id,
      members: {
        create: [
          { userId: admin.id, role: 'Project Manager' },
          { userId: manager.id, role: 'Lead Developer' }
        ]
      }
    }
  });

  console.log('✅ Projet créé:', project1.name);

  // Créer des tâches d'exemple
  const task1 = await prisma.task.create({
    data: {
      title: 'Design des maquettes UI/UX',
      description: 'Créer les maquettes pour toutes les pages principales',
      status: 'COMPLETED',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
      estimatedHours: 40,
      actualHours: 38,
      projectId: project1.id,
      assignedToId: manager.id,
      createdById: admin.id
    }
  });

  console.log('✅ Tâche créée:', task1.title);

  console.log('🎉 Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
