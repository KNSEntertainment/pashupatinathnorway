"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { EditableText } from "@/components/ui/EditableText";
import { AddSection } from "@/components/ui/AddSection";

interface CustomSection {
  id: string;
  title: string;
  content: string;
}

interface TermsContent {
  title: string;
  subtitle: string;
  importantNotice: string;
  aboutOrganization: string;
  membershipTerms: {
    free: string;
    freeTitle?: string;
    age: string;
    ageTitle?: string;
    individual: string;
    individualTitle?: string;
    accurate: string;
    accurateTitle?: string;
    single: string;
    singleTitle?: string;
  };
  dataProtection: string;
  membershipRights: {
    participation: string;
    participationTitle?: string;
    voting: string;
    votingTitle?: string;
    conduct: string;
    conductTitle?: string;
    communication: string;
    communicationTitle?: string;
  };
  cancellation: string;
  modification: string;
  contact: {
    email: string;
    website: string;
    organizationNumber: string;
  };
  customSections?: CustomSection[];
  // Additional dynamic properties for admin functionality
  importantNoticeTitle?: string;
  aboutOrganizationTitle?: string;
  membershipTermsTitle?: string;
  dataProtectionTitle?: string;
  membershipRightsTitle?: string;
  cancellationTitle?: string;
  modificationTitle?: string;
  contactTitle?: string;
  [key: string]: unknown; // Allow dynamic property access
}

export default function TermsAndConditions() {
  const [termsContent, setTermsContent] = useState<TermsContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await fetch('/api/terms');
      const result = await response.json();
      
      if (result.success) {
        setTermsContent(result.data);
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTerms = async (section: string, newValue: string) => {
    if (!termsContent) return;

    const updatedContent = { ...termsContent };
    
    // Handle nested object updates
    if (section.includes('.')) {
      const [parent, child] = section.split('.');
      const parentObj = (updatedContent as Record<string, unknown>)[parent] as Record<string, unknown>;
      (updatedContent as Record<string, unknown>)[parent] = {
        ...parentObj,
        [child]: newValue
      };
    } else {
      (updatedContent as Record<string, unknown>)[section] = newValue;
    }

    try {
      const response = await fetch('/api/terms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: updatedContent }),
      });

      if (response.ok) {
        setTermsContent(updatedContent);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving terms:', error);
      throw error;
    }
  };

  const deleteSection = async (section: string) => {
    if (!termsContent) return;

    const updatedContent = { ...termsContent };
    
    if (section.includes('.')) {
      const [parent, child] = section.split('.');
      if (updatedContent[parent] && typeof updatedContent[parent] === 'object') {
        const parentObj = updatedContent[parent] as Record<string, unknown>;
        delete parentObj[child];
        updatedContent[parent] = parentObj;
      }
    } else {
      delete (updatedContent as Record<string, unknown>)[section];
    }

    try {
      const response = await fetch('/api/terms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: updatedContent }),
      });

      if (response.ok) {
        setTermsContent(updatedContent);
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  };

  const addCustomSection = async (title: string, content: string) => {
    if (!termsContent) return;

    const updatedContent = { ...termsContent };
    const newSection: CustomSection = {
      id: Date.now().toString(),
      title,
      content
    };

    if (!updatedContent.customSections) {
      updatedContent.customSections = [];
    }
    updatedContent.customSections = [...updatedContent.customSections, newSection];

    try {
      const response = await fetch('/api/terms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: updatedContent }),
      });

      if (response.ok) {
        setTermsContent(updatedContent);
      } else {
        throw new Error('Failed to add section');
      }
    } catch (error) {
      console.error('Error adding section:', error);
      throw error;
    }
  };

  const deleteCustomSection = async (sectionId: string) => {
    if (!termsContent) return;

    const updatedContent = { ...termsContent };
    if (updatedContent.customSections) {
      updatedContent.customSections = updatedContent.customSections.filter(
        section => section.id !== sectionId
      );
    }

    try {
      const response = await fetch('/api/terms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: updatedContent }),
      });

      if (response.ok) {
        setTermsContent(updatedContent);
      } else {
        throw new Error('Failed to delete section');
      }
    } catch (error) {
      console.error('Error deleting custom section:', error);
      throw error;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!termsContent) {
    return <div className="flex justify-center items-center min-h-screen">Error loading terms</div>;
  }

  return (
    <div className="py-8">
      {/* Header */}
      <header className="">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <EditableText 
            value={termsContent.title} 
            onSave={(value) => saveTerms('title', value)}
            className="text-3xl font-bold text-gray-900"
          />
          <EditableText 
            value={termsContent.subtitle} 
            onSave={(value) => saveTerms('subtitle', value)}
            className="text-sm text-gray-900 mt-2"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {/* Important Notice */}
          <section className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-r-lg">
            <EditableText 
              value={(termsContent as Record<string, unknown>).importantNoticeTitle as string || "Important Notice"} 
              onSave={(value) => saveTerms('importantNoticeTitle', value)}
              className="text-xl font-bold text-red-900 mb-3 uppercase"
              showDelete
              onDelete={() => deleteSection('importantNoticeTitle')}
            />
            <EditableText 
              value={termsContent.importantNotice} 
              onSave={(value) => saveTerms('importantNotice', value)}
              className="text-gray-900 leading-relaxed font-medium"
              multiline
              showDelete
              onDelete={() => deleteSection('importantNotice')}
            />
          </section>

          {/* Organization Information */}
          <section>
            <EditableText 
              value={(termsContent as Record<string, unknown>).aboutOrganizationTitle as string || "About Our Organization"} 
              onSave={(value) => saveTerms('aboutOrganizationTitle', value)}
              className="text-2xl font-semibold text-gray-900 mb-4"
              showDelete
              onDelete={() => deleteSection('aboutOrganizationTitle')}
            />
            <EditableText 
              value={termsContent.aboutOrganization} 
              onSave={(value) => saveTerms('aboutOrganization', value)}
              className="text-gray-900 leading-relaxed mb-4"
              multiline
              showDelete
              onDelete={() => deleteSection('aboutOrganization')}
            />
          </section>

          {/* Membership Terms */}
          <section>
            <EditableText 
              value={(termsContent as Record<string, unknown>).membershipTermsTitle as string || "Membership Terms"} 
              onSave={(value) => saveTerms('membershipTermsTitle', value)}
              className="text-2xl font-semibold text-gray-900 mb-4"
              showDelete
              onDelete={() => deleteSection('membershipTermsTitle')}
            />
            <div className="space-y-4">
              <TermCard 
                title={termsContent.membershipTerms?.freeTitle || "Free Membership"} 
                description={termsContent.membershipTerms.free}
                onSaveTitle={(value) => saveTerms('membershipTerms.freeTitle', value)}
                onSaveContent={(value) => saveTerms('membershipTerms.free', value)}
                onDelete={() => deleteSection('membershipTerms.free')}
              />
              
              <TermCard 
                title={termsContent.membershipTerms?.ageTitle || "Age Requirements"} 
                description={termsContent.membershipTerms.age}
                onSaveTitle={(value) => saveTerms('membershipTerms.ageTitle', value)}
                onSaveContent={(value) => saveTerms('membershipTerms.age', value)}
                onDelete={() => deleteSection('membershipTerms.age')}
              />
              
              <TermCard 
                title={termsContent.membershipTerms?.individualTitle || "Individual Applications"} 
                description={termsContent.membershipTerms.individual}
                onSaveTitle={(value) => saveTerms('membershipTerms.individualTitle', value)}
                onSaveContent={(value) => saveTerms('membershipTerms.individual', value)}
                onDelete={() => deleteSection('membershipTerms.individual')}
              />
              
              <TermCard 
                title={termsContent.membershipTerms?.accurateTitle || "Accurate Information"} 
                description={termsContent.membershipTerms.accurate}
                onSaveTitle={(value) => saveTerms('membershipTerms.accurateTitle', value)}
                onSaveContent={(value) => saveTerms('membershipTerms.accurate', value)}
                onDelete={() => deleteSection('membershipTerms.accurate')}
              />
              
              <TermCard 
                title={termsContent.membershipTerms?.singleTitle || "Single Membership"} 
                description={termsContent.membershipTerms.single}
                onSaveTitle={(value) => saveTerms('membershipTerms.singleTitle', value)}
                onSaveContent={(value) => saveTerms('membershipTerms.single', value)}
                onDelete={() => deleteSection('membershipTerms.single')}
              />
            </div>
          </section>

          {/* Data Protection and Privacy */}
          <section>
            <EditableText 
              value={(termsContent as Record<string, unknown>).dataProtectionTitle as string || "Data Protection and Privacy"} 
              onSave={(value) => saveTerms('dataProtectionTitle', value)}
              className="text-2xl font-semibold text-gray-900 mb-4"
              showDelete
              onDelete={() => deleteSection('dataProtectionTitle')}
            />
            <EditableText 
              value={termsContent.dataProtection} 
              onSave={(value) => saveTerms('dataProtection', value)}
              className="text-gray-900 leading-relaxed mb-4"
              multiline
              showDelete
              onDelete={() => deleteSection('dataProtection')}
            />
          </section>

          {/* Membership Rights and Responsibilities */}
          <section>
            <EditableText 
              value={(termsContent as Record<string, unknown>).membershipRightsTitle as string || "Membership Rights and Responsibilities"} 
              onSave={(value) => saveTerms('membershipRightsTitle', value)}
              className="text-2xl font-semibold text-gray-900 mb-4"
              showDelete
              onDelete={() => deleteSection('membershipRightsTitle')}
            />
            <div className="space-y-4">
              <TermCard 
                title={termsContent.membershipRights?.participationTitle || "Participation Rights"} 
                description={termsContent.membershipRights.participation}
                onSaveTitle={(value) => saveTerms('membershipRights.participationTitle', value)}
                onSaveContent={(value) => saveTerms('membershipRights.participation', value)}
                onDelete={() => deleteSection('membershipRights.participation')}
              />
              
              <TermCard 
                title={termsContent.membershipRights?.votingTitle || "Voting Rights"} 
                description={termsContent.membershipRights.voting}
                onSaveTitle={(value) => saveTerms('membershipRights.votingTitle', value)}
                onSaveContent={(value) => saveTerms('membershipRights.voting', value)}
                onDelete={() => deleteSection('membershipRights.voting')}
              />
              
              <TermCard 
                title={termsContent.membershipRights?.conductTitle || "Code of Conduct"} 
                description={termsContent.membershipRights.conduct}
                onSaveTitle={(value) => saveTerms('membershipRights.conductTitle', value)}
                onSaveContent={(value) => saveTerms('membershipRights.conduct', value)}
                onDelete={() => deleteSection('membershipRights.conduct')}
              />
              
              <TermCard 
                title={termsContent.membershipRights?.communicationTitle || "Communication"} 
                description={termsContent.membershipRights.communication}
                onSaveTitle={(value) => saveTerms('membershipRights.communicationTitle', value)}
                onSaveContent={(value) => saveTerms('membershipRights.communication', value)}
                onDelete={() => deleteSection('membershipRights.communication')}
              />
            </div>
          </section>

          {/* Membership Cancellation */}
          <section>
            <EditableText 
              value={(termsContent as Record<string, unknown>).cancellationTitle as string || "Membership Cancellation"} 
              onSave={(value) => saveTerms('cancellationTitle', value)}
              className="text-2xl font-semibold text-gray-900 mb-4"
              showDelete
              onDelete={() => deleteSection('cancellationTitle')}
            />
            <EditableText 
              value={termsContent.cancellation} 
              onSave={(value) => saveTerms('cancellation', value)}
              className="text-gray-900 leading-relaxed mb-4"
              multiline
              showDelete
              onDelete={() => deleteSection('cancellation')}
            />
          </section>

          {/* Terms Modification */}
          <section className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <EditableText 
              value={(termsContent as Record<string, unknown>).modificationTitle as string || "Terms Modification"} 
              onSave={(value) => saveTerms('modificationTitle', value)}
              className="text-xl font-semibold text-gray-900 mb-3"
              showDelete
              onDelete={() => deleteSection('modificationTitle')}
            />
            <EditableText 
              value={termsContent.modification} 
              onSave={(value) => saveTerms('modification', value)}
              className="text-gray-900 leading-relaxed"
              multiline
              showDelete
              onDelete={() => deleteSection('modification')}
            />
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-6 rounded-r-lg">
            <EditableText 
              value={(termsContent as Record<string, unknown>).contactTitle as string || "Contact Information"} 
              onSave={(value) => saveTerms('contactTitle', value)}
              className="text-xl font-bold text-green-900 mb-3"
              showDelete
              onDelete={() => deleteSection('contactTitle')}
            />
            <div className="space-y-2">
              <p className="text-gray-900">
                <strong>Email:</strong> <EditableText 
                  value={termsContent.contact.email} 
                  onSave={(value) => saveTerms('contact.email', value)}
                  className="inline"
                />
              </p>
              <p className="text-gray-900">
                <strong>Website:</strong> <EditableText 
                  value={termsContent.contact.website} 
                  onSave={(value) => saveTerms('contact.website', value)}
                  className="inline"
                />
              </p>
              <p className="text-gray-900">
                <strong>Organization Number:</strong> <EditableText 
                  value={termsContent.contact.organizationNumber} 
                  onSave={(value) => saveTerms('contact.organizationNumber', value)}
                  className="inline"
                />
              </p>
            </div>
          </section>

          {/* Custom Sections */}
          {termsContent.customSections && termsContent.customSections.length > 0 && (
            <div className="space-y-6">
              {termsContent.customSections.map((section) => (
                <section key={section.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <EditableText 
                    value={section.title} 
                    onSave={(value) => {
                      const updatedSections = termsContent.customSections!.map(s => 
                        s.id === section.id ? { ...s, title: value } : s
                      );
                      const updatedContent = { ...termsContent, customSections: updatedSections };
                      return fetch('/api/terms', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: updatedContent }),
                      }).then(() => setTermsContent(updatedContent));
                    }}
                    className="text-2xl font-semibold text-gray-900 mb-4"
                    showDelete
                    onDelete={() => deleteCustomSection(section.id)}
                  />
                  <EditableText 
                    value={section.content} 
                    onSave={(value) => {
                      const updatedSections = termsContent.customSections!.map(s => 
                        s.id === section.id ? { ...s, content: value } : s
                      );
                      const updatedContent = { ...termsContent, customSections: updatedSections };
                      return fetch('/api/terms', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: updatedContent }),
                      }).then(() => setTermsContent(updatedContent));
                    }}
                    className="text-gray-900 leading-relaxed"
                    multiline
                    showDelete
                    onDelete={() => deleteCustomSection(section.id)}
                  />
                </section>
              ))}
            </div>
          )}

          {/* Add Section Component */}
          <AddSection onAdd={addCustomSection} />

          {/* Related Documents */}
          <section className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Documents</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/en/privacy-policy" className="inline-flex items-center px-4 py-2 bg-brand_primary text-gray-700 rounded-lg hover:scale-105 transition-all">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Privacy Policy
              </Link>
              <Link href="/en/membership" className="inline-flex items-center px-4 py-2 bg-neutral-600 text-white rounded-lg  hover:scale-105 transition-all">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Membership Application
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-900 text-sm">
          <p>© 2025 Pashupatinath Norway Temple. All rights reserved.</p>
          <p className="mt-1">Organization Number: 926 499 211</p>
          <p className="mt-1">By submitting a membership application, you agree to these Terms and Conditions</p>
        </div>
      </footer>
    </div>
  );
}

function TermCard({ title, description, onSaveTitle, onSaveContent, onDelete }: { 
  title: string; 
  description: string; 
  onSaveTitle?: (value: string) => void;
  onSaveContent?: (value: string) => void;
  onDelete?: () => void;
}) {
	return (
		<div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-5 border border-indigo-100">
			<div className="flex items-start">
				<div className="flex-shrink-0 mr-3">
					<svg className="w-6 h-6 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
					</svg>
				</div>
				<div className="flex-1">
					{onSaveTitle ? (
						<EditableText 
							value={title} 
							onSave={onSaveTitle}
							className="font-semibold text-gray-900 mb-2"
							showDelete={!!onDelete}
							onDelete={onDelete}
						/>
					) : (
						<h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
					)}
					{onSaveContent ? (
						<EditableText 
							value={description} 
							onSave={onSaveContent}
							className="text-gray-900 text-sm leading-relaxed"
							multiline
							showDelete={!!onDelete}
							onDelete={onDelete}
						/>
					) : (
						<p className="text-gray-900 text-sm leading-relaxed">{description}</p>
					)}
				</div>
			</div>
		</div>
	);
}
