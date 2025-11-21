import { ApiProperty } from "@nestjs/swagger";

export class UpdateStateDto {
    @ApiProperty({ required: false})
    financialInstitutions?: number;
    @ApiProperty({ required: false})
    beneficiaries?: number;
    @ApiProperty({ required: false})
    amountApproved?: number;
    @ApiProperty({ required: false})
    amountDisbursed?: number;
    @ApiProperty({ required: false})
    businessesFinanced?: number;
    @ApiProperty({ required: false})
    greenTransactions?: number;
    @ApiProperty({ required: false})
    femaleBeneficiaries?: number;
    @ApiProperty({ required: false})
    bankBranchesTransitioned?: number;
    @ApiProperty({ required: false})
    carbonEmissionsSaved?: number;
}

export class UpdateSummaryDto {
    @ApiProperty({ required: false})
    financialInstitutions?: string;
    @ApiProperty({ required: false})
    beneficiaries?: string;
    @ApiProperty({ required: false})
    amountApproved?: string;
    @ApiProperty({ required: false})
    amountDisbursed?: string;
    @ApiProperty({ required: false})
    businessesFinanced?: string;
    @ApiProperty({ required: false})
    greenTransactions?: string;
    @ApiProperty({ required: false})
    femaleBeneficiaries?: string;
    @ApiProperty({ required: false})
    bankBranchesTransitioned?: string;
    @ApiProperty({ required: false})
    carbonEmissionsSaved?: string;
}

export class CreateWhistleblowingReportDto {
    // Your Information (Optional)
    @ApiProperty({ required: false, description: 'First name of the reporter' })
    firstName?: string;
    @ApiProperty({ required: false, description: 'Last name of the reporter' })
    lastName?: string;
    @ApiProperty({ required: false, description: 'Email of the reporter' })
    email?: string;
    @ApiProperty({ required: false, description: 'Phone number of the reporter' })
    phone?: string;
    @ApiProperty({ required: false, description: 'Role of the reporter (Employee, Vendor, etc.)' })
    role?: string;

    // Incident Details
    @ApiProperty({ description: 'Type of misconduct (Fraud, Harassment, Corruption, etc.)' })
    misconductType: string;
    @ApiProperty({ description: 'Date and time of the incident (ISO string)' })
    incidentDateTime: string;
    @ApiProperty({ required: false, description: 'Location or department where the incident occurred' })
    location?: string;
    @ApiProperty({ required: false, description: 'People involved in the incident (if known)' })
    peopleInvolved?: string;
    @ApiProperty({ description: 'Detailed description of what happened' })
    description: string;
    @ApiProperty({ description: 'How did you become aware of this incident?' })
    howAwareDetails: string;
    @ApiProperty({ required: false, default: false, description: 'Do you have supporting evidence?' })
    hasSupportingEvidence?: boolean;

    // Confidentiality & Follow-up
    @ApiProperty({ required: false, default: false, description: 'Do you wish to remain anonymous?' })
    remainAnonymous?: boolean;
    @ApiProperty({ required: false, default: false, description: 'Can we contact you for more details?' })
    canContact?: boolean;
    @ApiProperty({ required: false, description: 'Any additional comments' })
    additionalComments?: string;

    // File upload (handled by multer, not in DTO)
    evidenceFile?: any;
}

export class CreateContactSubmissionDto {
    @ApiProperty({ description: 'Full name of the person contacting' })
    name: string;
    @ApiProperty({ description: 'Email address' })
    email: string;
    @ApiProperty({ required: false, description: 'Phone number' })
    phone?: string;
    @ApiProperty({ description: 'Message or notes' })
    notes: string;
}

