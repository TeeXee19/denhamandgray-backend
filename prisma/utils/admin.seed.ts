import { PrismaClient } from "@prisma/client";
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

export function generateToken(prefix?: string, suffix?: string) {
    // Generate a password reset token with a length of 32 bytes (length/2 hex characters)
    let token = crypto.randomBytes(8).toString('hex');
    if (prefix) {
        token = prefix + token
    }
    if (suffix) {
        token += suffix
    }
    return token
}

async function createSuperAdmin() {
    const saltOrRounds = 10;
    const hashed = await bcrypt.hash("pass", saltOrRounds);

    const existingAdmin = await prisma.user.findUnique({
        where: {
            email: "admin@test.com"
        }
    })

    if (!existingAdmin) {
        const superAdmin = await prisma.user.create({
            data: {
                email: "admin@test.com",
                name: "Super Admin",
                phone: "1234567",
                password: hashed,
                password_reset_token: generateToken(),
            }
        });
    }
    
    const existingSummary = await prisma.summary.findUnique({
        where: {
            id: 1
        }
    })

    if (!existingSummary) {
        const summary = await prisma.summary.create({
            data: {
                financialInstitutions: "3",
                amountApproved: "N5billion",
                amountDisbursed: "N300million",
                businessesFinanced: "1,000",
                greenTransactions: "50%",
                femaleBeneficiaries: "70%",
                bankBranchesTransitioned: "10",
                carbonEmissionsSaved: "XXX"
            }
        });
    }
}

createSuperAdmin()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });