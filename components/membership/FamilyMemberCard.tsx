// components/membership/FamilyMemberCard.tsx
"use client";
import { FamilyMember } from "@/components/membership/types/membership";
import { FormField, StyledInput } from "./FormField";

interface FamilyMemberCardProps {
	member: FamilyMember;
	index: number;
	errors: Record<string, string>;
	onUpdate: (id: string, field: keyof FamilyMember, value: string) => void;
	onRemove: (id: string) => void;
	labels: {
		title: string;
		remove: string;
		firstName: string;
		firstNamePlaceholder: string;
		middleName: string;
		middleNamePlaceholder: string;
		lastName: string;
		lastNamePlaceholder: string;
		personalNumber: string;
		personalNumberPlaceholder: string;
		email: string;
		emailPlaceholder: string;
		phone: string;
		phonePlaceholder: string;
	};
}

export function FamilyMemberCard({
	member,
	index,
	errors,
	onUpdate,
	onRemove,
	labels,
}: FamilyMemberCardProps) {
	return (
		<div className="border border-light rounded-lg p-4 bg-gray-50">
			<div className="flex justify-between items-center mb-3">
				<h4 className="font-medium text-gray-900">
					{labels.title} {index + 1}
				</h4>
				<button
					type="button"
					onClick={() => onRemove(member.id)}
					className="text-red-600 hover:text-red-800 text-sm font-medium"
				>
					{labels.remove}
				</button>
			</div>

			<div className="grid md:grid-cols-2 gap-4">
				<FormField label={labels.firstName} required>
					<StyledInput
						inputSize="sm"
						type="text"
						value={member.firstName}
						onChange={(e) => onUpdate(member.id, "firstName", e.target.value)}
						placeholder={labels.firstNamePlaceholder}
					/>
				</FormField>

				<FormField label={labels.middleName}>
					<StyledInput
						inputSize="sm"
						type="text"
						value={member.middleName}
						onChange={(e) => onUpdate(member.id, "middleName", e.target.value)}
						placeholder={labels.middleNamePlaceholder}
					/>
				</FormField>

				<FormField label={labels.lastName} required>
					<StyledInput
						inputSize="sm"
						type="text"
						value={member.lastName}
						onChange={(e) => onUpdate(member.id, "lastName", e.target.value)}
						placeholder={labels.lastNamePlaceholder}
					/>
				</FormField>

				<FormField
					label={labels.personalNumber}
					required
					error={errors[`${member.id}-personalNumber`]}
				>
					<StyledInput
						inputSize="sm"
						type="text"
						value={member.personalNumber}
						onChange={(e) => onUpdate(member.id, "personalNumber", e.target.value)}
						maxLength={11}
						pattern="\d{11}"
						hasError={!!errors[`${member.id}-personalNumber`]}
						placeholder={labels.personalNumberPlaceholder}
					/>
				</FormField>

				<FormField
					label={labels.email}
					required
					error={errors[`${member.id}-email`]}
				>
					<StyledInput
						inputSize="sm"
						type="email"
						value={member.email}
						onChange={(e) => onUpdate(member.id, "email", e.target.value)}
						hasError={!!errors[`${member.id}-email`]}
						placeholder={labels.emailPlaceholder}
					/>
				</FormField>

				<FormField
					label={labels.phone}
					error={errors[`${member.id}-phone`]}
				>
					<StyledInput
						inputSize="sm"
						type="tel"
						value={member.phone}
						onChange={(e) => {
							const value = e.target.value.replace(/\D/g, "").slice(0, 8);
							onUpdate(member.id, "phone", value);
						}}
						maxLength={8}
						hasError={!!errors[`${member.id}-phone`]}
						placeholder={labels.phonePlaceholder}
					/>
				</FormField>

				{/* Required fields error */}
				{errors[`${member.id}-required`] && (
					<div className="md:col-span-2">
						<p className="text-red-600 text-sm">{errors[`${member.id}-required`]}</p>
					</div>
				)}
			</div>
		</div>
	);
}