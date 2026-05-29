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

interface Settings {
  email?: string;
  website?: string;
  organizationNumber?: string;
  [key: string]: unknown;
}

interface PrivacyPolicyContent {
  title: string;
  lastUpdated: string;
  introduction: string;
  informationWeCollect: {
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      titleKey?: string;
    }>;
  };
  howWeUseInformation: {
    title: string;
    description: string;
    items: Array<{
      type: string;
      purpose: string;
      typeKey?: string;
    }>;
  };
  dataProtection: {
    title: string;
    description: string;
    items: string[];
  };
  dataSharing: {
    title: string;
    description: string;
    items: Array<{
      type: string;
      purpose: string;
      typeKey?: string;
    }>;
  };
  yourRights: {
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      titleKey?: string;
    }>;
  };
  dataRetention: {
    title: string;
    description: string;
    items: string[];
  };
  childrensPrivacy: {
    title: string;
    content: string;
  };
  policyUpdates: {
    title: string;
    content: string;
  };
  contact: {
    title: string;
    description: string;
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

export default function PrivacyPolicy() {
  const [privacyPolicyContent, setPrivacyPolicyContent] = useState<PrivacyPolicyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetchPrivacyPolicy();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data && data.length > 0) {
        setSettings(data[0]);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchPrivacyPolicy = async () => {
    try {
      const response = await fetch('/api/privacy-policy');
      const result = await response.json();
      
      if (result.success) {
        setPrivacyPolicyContent(result.data);
      }
    } catch (error) {
      console.error('Error fetching privacy policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePrivacyPolicy = async (section: string, newValue: string) => {
    if (!privacyPolicyContent) return;

    const updatedContent = { ...privacyPolicyContent };
    
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
      const response = await fetch('/api/privacy-policy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: updatedContent }),
      });

      if (response.ok) {
        setPrivacyPolicyContent(updatedContent);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving privacy policy:', error);
      throw error;
    }
  };

  const deleteSection = async (section: string) => {
    if (!privacyPolicyContent) return;

    const updatedContent = { ...privacyPolicyContent };
    
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
      const response = await fetch('/api/privacy-policy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: updatedContent }),
      });

      if (response.ok) {
        setPrivacyPolicyContent(updatedContent);
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  };

  const addCustomSection = async (title: string, content: string) => {
    if (!privacyPolicyContent) return;

    const updatedContent = { ...privacyPolicyContent };
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
      const response = await fetch('/api/privacy-policy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: updatedContent }),
      });

      if (response.ok) {
        setPrivacyPolicyContent(updatedContent);
      } else {
        throw new Error('Failed to add section');
      }
    } catch (error) {
      console.error('Error adding section:', error);
      throw error;
    }
  };

  const deleteCustomSection = async (sectionId: string) => {
    if (!privacyPolicyContent) return;

    const updatedContent = { ...privacyPolicyContent };
    if (updatedContent.customSections) {
      updatedContent.customSections = updatedContent.customSections.filter(
        section => section.id !== sectionId
      );
    }

    try {
      const response = await fetch('/api/privacy-policy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: updatedContent }),
      });

      if (response.ok) {
        setPrivacyPolicyContent(updatedContent);
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

  if (!privacyPolicyContent) {
    return <div className="flex justify-center items-center min-h-screen">Error loading privacy policy</div>;
  }

  return (
    <div className="py-8">
      {/* Header */}
      <header className="">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <EditableText 
            value={privacyPolicyContent.title} 
            onSave={(value) => savePrivacyPolicy('title', value)}
            className="text-3xl font-bold text-gray-900"
            showDelete
            onDelete={() => deleteSection('title')}
          />
          <EditableText 
            value={`Last Updated: ${privacyPolicyContent.lastUpdated}`} 
            onSave={(value) => savePrivacyPolicy('lastUpdated', value.replace('Last Updated: ', ''))}
            className="text-sm text-gray-900 mt-2"
            showDelete
            onDelete={() => deleteSection('lastUpdated')}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {/* Introduction */}
          <section>
            <EditableText 
              value={privacyPolicyContent.introduction} 
              onSave={(value) => savePrivacyPolicy('introduction', value)}
              className="text-gray-900 leading-relaxed"
              multiline
              showDelete
              onDelete={() => deleteSection('introduction')}
            />
          </section>

          {/* Information We Collect */}
          <section>
            <EditableText 
              value={privacyPolicyContent.informationWeCollect.title} 
              onSave={(value) => savePrivacyPolicy('informationWeCollect.title', value)}
              className="text-2xl font-semibold text-gray-900 mb-4"
              showDelete
              onDelete={() => deleteSection('informationWeCollect.title')}
            />
            <EditableText 
              value={privacyPolicyContent.informationWeCollect.description} 
              onSave={(value) => savePrivacyPolicy('informationWeCollect.description', value)}
              className="text-gray-900 leading-relaxed mb-4"
              multiline
              showDelete
              onDelete={() => deleteSection('informationWeCollect.description')}
            />

            <div className="space-y-3">
              {privacyPolicyContent.informationWeCollect.items.map((item, index) => (
                <DataItem 
                  key={index}
                  title={item.title} 
                  description={item.description}
                  onSaveTitle={(value) => {
                    const updatedItems = [...privacyPolicyContent.informationWeCollect.items];
                    updatedItems[index] = { ...updatedItems[index], title: value };
                    const updatedContent = { ...privacyPolicyContent };
                    updatedContent.informationWeCollect.items = updatedItems;
                    return fetch('/api/privacy-policy', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: updatedContent }),
                    }).then(() => setPrivacyPolicyContent(updatedContent));
                  }}
                  onSaveContent={(value) => {
                    const updatedItems = [...privacyPolicyContent.informationWeCollect.items];
                    updatedItems[index] = { ...updatedItems[index], description: value };
                    const updatedContent = { ...privacyPolicyContent };
                    updatedContent.informationWeCollect.items = updatedItems;
                    return fetch('/api/privacy-policy', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: updatedContent }),
                    }).then(() => setPrivacyPolicyContent(updatedContent));
                  }}
                  onDelete={() => {
                    const updatedItems = privacyPolicyContent.informationWeCollect.items.filter((_, i) => i !== index);
                    const updatedContent = { ...privacyPolicyContent };
                    updatedContent.informationWeCollect.items = updatedItems;
                    return fetch('/api/privacy-policy', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: updatedContent }),
                    }).then(() => setPrivacyPolicyContent(updatedContent));
                  }}
                />
              ))}
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <EditableText 
              value={privacyPolicyContent.howWeUseInformation.title} 
              onSave={(value) => savePrivacyPolicy('howWeUseInformation.title', value)}
              className="text-2xl font-semibold text-gray-900 mb-4"
              showDelete
              onDelete={() => deleteSection('howWeUseInformation.title')}
            />
            <EditableText 
              value={privacyPolicyContent.howWeUseInformation.description} 
              onSave={(value) => savePrivacyPolicy('howWeUseInformation.description', value)}
              className="text-gray-900 leading-relaxed mb-4"
              multiline
              showDelete
              onDelete={() => deleteSection('howWeUseInformation.description')}
            />

            <div className="space-y-3">
              {privacyPolicyContent.howWeUseInformation.items.map((item, index) => (
                <DataUseItem 
                  key={index}
                  type={item.type} 
                  purpose={item.purpose}
                  onSaveType={(value) => {
                    const updatedItems = [...privacyPolicyContent.howWeUseInformation.items];
                    updatedItems[index] = { ...updatedItems[index], type: value };
                    const updatedContent = { ...privacyPolicyContent };
                    updatedContent.howWeUseInformation.items = updatedItems;
                    return fetch('/api/privacy-policy', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: updatedContent }),
                    }).then(() => setPrivacyPolicyContent(updatedContent));
                  }}
                  onSavePurpose={(value) => {
                    const updatedItems = [...privacyPolicyContent.howWeUseInformation.items];
                    updatedItems[index] = { ...updatedItems[index], purpose: value };
                    const updatedContent = { ...privacyPolicyContent };
                    updatedContent.howWeUseInformation.items = updatedItems;
                    return fetch('/api/privacy-policy', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: updatedContent }),
                    }).then(() => setPrivacyPolicyContent(updatedContent));
                  }}
                  onDelete={() => {
                    const updatedItems = privacyPolicyContent.howWeUseInformation.items.filter((_, i) => i !== index);
                    const updatedContent = { ...privacyPolicyContent };
                    updatedContent.howWeUseInformation.items = updatedItems;
                    return fetch('/api/privacy-policy', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: updatedContent }),
                    }).then(() => setPrivacyPolicyContent(updatedContent));
                  }}
                />
              ))}
            </div>
          </section>

          {/* Data Protection and Security */}
          <section>
            <EditableText 
              value={privacyPolicyContent.dataProtection.title} 
              onSave={(value) => savePrivacyPolicy('dataProtection.title', value)}
              className="text-2xl font-semibold text-gray-900 mb-4"
              showDelete
              onDelete={() => deleteSection('dataProtection.title')}
            />
            <EditableText 
              value={privacyPolicyContent.dataProtection.description} 
              onSave={(value) => savePrivacyPolicy('dataProtection.description', value)}
              className="text-gray-900 leading-relaxed mb-4"
              multiline
              showDelete
              onDelete={() => deleteSection('dataProtection.description')}
            />
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              {privacyPolicyContent.dataProtection.items.map((item, index) => (
                <div key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <EditableText 
                    value={item} 
                    onSave={(value) => {
                      const updatedItems = [...privacyPolicyContent.dataProtection.items];
                      updatedItems[index] = value;
                      const updatedContent = { ...privacyPolicyContent };
                      updatedContent.dataProtection.items = updatedItems;
                      return fetch('/api/privacy-policy', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: updatedContent }),
                      }).then(() => setPrivacyPolicyContent(updatedContent));
                    }}
                    className="text-gray-900"
                    showDelete
                    onDelete={() => {
                      const updatedItems = privacyPolicyContent.dataProtection.items.filter((_, i) => i !== index);
                      const updatedContent = { ...privacyPolicyContent };
                      updatedContent.dataProtection.items = updatedItems;
                      return fetch('/api/privacy-policy', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: updatedContent }),
                      }).then(() => setPrivacyPolicyContent(updatedContent));
                    }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <EditableText 
              value={privacyPolicyContent.dataSharing.title} 
              onSave={(value) => savePrivacyPolicy('dataSharing.title', value)}
              className="text-2xl font-semibold text-gray-900 mb-4"
              showDelete
              onDelete={() => deleteSection('dataSharing.title')}
            />
            <EditableText 
              value={privacyPolicyContent.dataSharing.description} 
              onSave={(value) => savePrivacyPolicy('dataSharing.description', value)}
              className="text-gray-900 leading-relaxed mb-4"
              multiline
              showDelete
              onDelete={() => deleteSection('dataSharing.description')}
            />
            <div className="space-y-3">
              {privacyPolicyContent.dataSharing.items.map((item, index) => (
                <DataUseItem 
                  key={index}
                  type={item.type} 
                  purpose={item.purpose}
                  onSaveType={(value) => {
                    const updatedItems = [...privacyPolicyContent.dataSharing.items];
                    updatedItems[index] = { ...updatedItems[index], type: value };
                    const updatedContent = { ...privacyPolicyContent };
                    updatedContent.dataSharing.items = updatedItems;
                    return fetch('/api/privacy-policy', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: updatedContent }),
                    }).then(() => setPrivacyPolicyContent(updatedContent));
                  }}
                  onSavePurpose={(value) => {
                    const updatedItems = [...privacyPolicyContent.dataSharing.items];
                    updatedItems[index] = { ...updatedItems[index], purpose: value };
                    const updatedContent = { ...privacyPolicyContent };
                    updatedContent.dataSharing.items = updatedItems;
                    return fetch('/api/privacy-policy', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: updatedContent }),
                    }).then(() => setPrivacyPolicyContent(updatedContent));
                  }}
                  onDelete={() => {
                    const updatedItems = privacyPolicyContent.dataSharing.items.filter((_, i) => i !== index);
                    const updatedContent = { ...privacyPolicyContent };
                    updatedContent.dataSharing.items = updatedItems;
                    return fetch('/api/privacy-policy', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: updatedContent }),
                    }).then(() => setPrivacyPolicyContent(updatedContent));
                  }}
                />
              ))}
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <EditableText 
              value={privacyPolicyContent.yourRights.title} 
              onSave={(value) => savePrivacyPolicy('yourRights.title', value)}
              className="text-2xl font-semibold text-gray-900 mb-4"
              showDelete
              onDelete={() => deleteSection('yourRights.title')}
            />
            <EditableText 
              value={privacyPolicyContent.yourRights.description} 
              onSave={(value) => savePrivacyPolicy('yourRights.description', value)}
              className="text-gray-900 leading-relaxed mb-4"
              multiline
              showDelete
              onDelete={() => deleteSection('yourRights.description')}
            />
            <div className="space-y-3">
              {privacyPolicyContent.yourRights.items.map((item, index) => (
                <RightsCard 
                  key={index}
                  title={item.title} 
                  description={item.description}
                  onSaveTitle={(value) => {
                    const updatedItems = [...privacyPolicyContent.yourRights.items];
                    updatedItems[index] = { ...updatedItems[index], title: value };
                    const updatedContent = { ...privacyPolicyContent };
                    updatedContent.yourRights.items = updatedItems;
                    return fetch('/api/privacy-policy', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: updatedContent }),
                    }).then(() => setPrivacyPolicyContent(updatedContent));
                  }}
                  onSaveContent={(value) => {
                    const updatedItems = [...privacyPolicyContent.yourRights.items];
                    updatedItems[index] = { ...updatedItems[index], description: value };
                    const updatedContent = { ...privacyPolicyContent };
                    updatedContent.yourRights.items = updatedItems;
                    return fetch('/api/privacy-policy', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: updatedContent }),
                    }).then(() => setPrivacyPolicyContent(updatedContent));
                  }}
                  onDelete={() => {
                    const updatedItems = privacyPolicyContent.yourRights.items.filter((_, i) => i !== index);
                    const updatedContent = { ...privacyPolicyContent };
                    updatedContent.yourRights.items = updatedItems;
                    return fetch('/api/privacy-policy', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: updatedContent }),
                    }).then(() => setPrivacyPolicyContent(updatedContent));
                  }}
                />
              ))}
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <EditableText 
              value={privacyPolicyContent.dataRetention.title} 
              onSave={(value) => savePrivacyPolicy('dataRetention.title', value)}
              className="text-2xl font-semibold text-gray-900 mb-4"
              showDelete
              onDelete={() => deleteSection('dataRetention.title')}
            />
            <EditableText 
              value={privacyPolicyContent.dataRetention.description} 
              onSave={(value) => savePrivacyPolicy('dataRetention.description', value)}
              className="text-gray-900 leading-relaxed mb-4"
              multiline
              showDelete
              onDelete={() => deleteSection('dataRetention.description')}
            />
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {privacyPolicyContent.dataRetention.items.map((item, index) => (
                <div key={index} className="flex items-start">
                  <span className="font-semibold text-gray-900 mr-2">•</span>
                  <EditableText 
                    value={item} 
                    onSave={(value) => {
                      const updatedItems = [...privacyPolicyContent.dataRetention.items];
                      updatedItems[index] = value;
                      const updatedContent = { ...privacyPolicyContent };
                      updatedContent.dataRetention.items = updatedItems;
                      return fetch('/api/privacy-policy', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: updatedContent }),
                      }).then(() => setPrivacyPolicyContent(updatedContent));
                    }}
                    className="text-gray-900"
                    showDelete
                    onDelete={() => {
                      const updatedItems = privacyPolicyContent.dataRetention.items.filter((_, i) => i !== index);
                      const updatedContent = { ...privacyPolicyContent };
                      updatedContent.dataRetention.items = updatedItems;
                      return fetch('/api/privacy-policy', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: updatedContent }),
                      }).then(() => setPrivacyPolicyContent(updatedContent));
                    }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <EditableText 
              value={privacyPolicyContent.childrensPrivacy.title} 
              onSave={(value) => savePrivacyPolicy('childrensPrivacy.title', value)}
              className="text-2xl font-semibold text-gray-900 mb-4"
              showDelete
              onDelete={() => deleteSection('childrensPrivacy.title')}
            />
            <EditableText 
              value={privacyPolicyContent.childrensPrivacy.content} 
              onSave={(value) => savePrivacyPolicy('childrensPrivacy.content', value)}
              className="text-gray-900 leading-relaxed"
              multiline
              showDelete
              onDelete={() => deleteSection('childrensPrivacy.content')}
            />
          </section>

          {/* Policy Updates */}
          <section className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <EditableText 
              value={privacyPolicyContent.policyUpdates.title} 
              onSave={(value) => savePrivacyPolicy('policyUpdates.title', value)}
              className="text-xl font-semibold text-gray-900 mb-3"
              showDelete
              onDelete={() => deleteSection('policyUpdates.title')}
            />
            <EditableText 
              value={privacyPolicyContent.policyUpdates.content} 
              onSave={(value) => savePrivacyPolicy('policyUpdates.content', value)}
              className="text-gray-900 leading-relaxed"
              multiline
              showDelete
              onDelete={() => deleteSection('policyUpdates.content')}
            />
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-6 rounded-r-lg">
            <EditableText 
              value={privacyPolicyContent.contact.title} 
              onSave={(value) => savePrivacyPolicy('contact.title', value)}
              className="text-xl font-bold text-green-900 mb-3"
              showDelete
              onDelete={() => deleteSection('contact.title')}
            />
            <EditableText 
              value={privacyPolicyContent.contact.description} 
              onSave={(value) => savePrivacyPolicy('contact.description', value)}
              className="text-gray-900 leading-relaxed mb-4"
              multiline
              showDelete
              onDelete={() => deleteSection('contact.description')}
            />
            <div className="space-y-2">
              <div className="text-gray-900">
                <strong>Email:</strong> {settings?.email || privacyPolicyContent.contact.email}
              </div>
              <div className="text-gray-900">
                <strong>Website:</strong> {settings?.website || privacyPolicyContent.contact.website}
              </div>
              <div className="text-gray-900">
                <strong>Organization Number:</strong> {settings?.organizationNumber || privacyPolicyContent.contact.organizationNumber}
              </div>
            </div>
          </section>

          {/* Custom Sections */}
          {privacyPolicyContent.customSections && privacyPolicyContent.customSections.length > 0 && (
            <div className="space-y-6">
              {privacyPolicyContent.customSections.map((section) => (
                <section key={section.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <EditableText 
                    value={section.title} 
                    onSave={(value) => {
                      const updatedSections = privacyPolicyContent.customSections!.map(s => 
                        s.id === section.id ? { ...s, title: value } : s
                      );
                      const updatedContent = { ...privacyPolicyContent, customSections: updatedSections };
                      return fetch('/api/privacy-policy', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: updatedContent }),
                      }).then(() => setPrivacyPolicyContent(updatedContent));
                    }}
                    className="text-2xl font-semibold text-gray-900 mb-4"
                    showDelete
                    onDelete={() => deleteCustomSection(section.id)}
                  />
                  <EditableText 
                    value={section.content} 
                    onSave={(value) => {
                      const updatedSections = privacyPolicyContent.customSections!.map(s => 
                        s.id === section.id ? { ...s, content: value } : s
                      );
                      const updatedContent = { ...privacyPolicyContent, customSections: updatedSections };
                      return fetch('/api/privacy-policy', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: updatedContent }),
                      }).then(() => setPrivacyPolicyContent(updatedContent));
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
              <Link href="/en/terms-and-conditions" className="inline-flex items-center px-4 py-2 bg-brand_primary text-gray-700 rounded-lg hover:scale-105 transition-all">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Terms and Conditions
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
          <p className="mt-1">This Privacy Policy is effective as of {privacyPolicyContent.lastUpdated}</p>
        </div>
      </footer>
    </div>
  );
}

function DataItem({ 
  title, 
  description, 
  onSaveTitle, 
  onSaveContent, 
  onDelete 
}: { 
  title: string; 
  description: string;
  onSaveTitle?: (value: string) => void;
  onSaveContent?: (value: string) => void;
  onDelete?: () => void;
}) {
	return (
		<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
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
	);
}

function DataUseItem({ 
  type, 
  purpose, 
  onSaveType, 
  onSavePurpose, 
  onDelete 
}: { 
  type: string; 
  purpose: string;
  onSaveType?: (value: string) => void;
  onSavePurpose?: (value: string) => void;
  onDelete?: () => void;
}) {
	return (
		<div className="flex items-start">
			<span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
			<p className="text-gray-900">
				{onSaveType ? (
					<EditableText 
						value={type} 
						onSave={onSaveType}
						className="font-semibold text-gray-900 inline"
						showDelete={!!onDelete}
						onDelete={onDelete}
					/>
				) : (
					<span className="font-semibold text-gray-900">{type}</span>
				)}{" - "}
				{onSavePurpose ? (
					<EditableText 
						value={purpose} 
						onSave={onSavePurpose}
						className="inline"
						showDelete={!!onDelete}
						onDelete={onDelete}
					/>
				) : (
					<span>{purpose}</span>
				)}
			</p>
		</div>
	);
}

function RightsCard({ 
  title, 
  description, 
  onSaveTitle, 
  onSaveContent, 
  onDelete 
}: { 
  title: string; 
  description: string;
  onSaveTitle?: (value: string) => void;
  onSaveContent?: (value: string) => void;
  onDelete?: () => void;
}) {
	return (
		<div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
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
	);
}
