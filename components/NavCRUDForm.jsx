import React, { useEffect, useState } from "react";

const emptyNav = { title: "", href: "", hasHref: true, dropdownItems: [] };

export default function NavCRUDForm() {
	const [navItems, setNavItems] = useState([]);
	const [form, setForm] = useState(emptyNav);
	const [editingId, setEditingId] = useState(null);
	const [hrefError, setHrefError] = useState("");

	useEffect(() => {
		fetchNavItems();
	}, []);

	async function fetchNavItems() {
		const res = await fetch("/api/nav");
		const data = await res.json();
		setNavItems(data.navItems || []);
	}

	function handleChange(e) {
		const { name, value, type, checked } = e.target;
		if (type === "checkbox") {
			setForm({ ...form, [name]: checked });
			if (name === "hasHref" && !checked) {
				setForm((prev) => ({ ...prev, href: "" }));
			}
		} else {
			setForm({ ...form, [name]: value });
			if (name === "href") {
				validateHref(value);
			}
		}
	}

	function validateHref(href) {
		if (!href) {
			setHrefError("");
			return;
		}
		// Check for duplicate hrefs in navItems and dropdownItems
		const allHrefs = [...navItems.map((item) => item.href), ...navItems.flatMap((item) => (item.dropdownItems || []).map((d) => d.href))];
		// Exclude current editingId
		const isDuplicate = allHrefs.filter((h) => h === href && (editingId ? h !== form.href : true)).length > 0;
		if (isDuplicate) {
			setHrefError("This href is already used in another nav item or dropdown.");
		} else {
			setHrefError("");
		}
	}

	function handleDropdownChange(idx, field, value) {
		const updated = form.dropdownItems.map((item, i) => (i === idx ? { ...item, [field]: value } : item));
		setForm({ ...form, dropdownItems: updated });
	}

	function addDropdownItem() {
		setForm({ ...form, dropdownItems: [...form.dropdownItems, { title: "", href: "" }] });
	}

	function removeDropdownItem(idx) {
		setForm({ ...form, dropdownItems: form.dropdownItems.filter((_, i) => i !== idx) });
	}

	async function handleSubmit(e) {
		e.preventDefault();
		try {
			if (form.hasHref && hrefError) {
				alert("Please fix the href error before submitting.");
				return;
			}
			let res, data;
			// Clean form data: remove href if hasHref is false
			const payload = { ...form };
			if (payload.hasHref && payload.href) {
				// Ensure href starts with '/'
				if (!payload.href.startsWith("/")) {
					payload.href = "/" + payload.href;
				}
			}
			if (!payload.hasHref) {
				delete payload.href;
			}
			// Always remove hasHref from payload (not needed in DB)
			delete payload.hasHref;
			console.log("Submitting nav payload", payload);
			if (editingId) {
				res = await fetch(`/api/nav/${editingId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				data = await res.json();
				console.log("PUT response", data);
			} else {
				res = await fetch("/api/nav", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				data = await res.json();
				console.log("POST response", data);
			}
			if (!res.ok) {
				alert("Error: " + (data?.error || res.statusText));
				return;
			}
			setForm(emptyNav);
			setEditingId(null);
			fetchNavItems();
		} catch (err) {
			console.error("handleSubmit error", err);
			alert("An error occurred. See console for details.");
		}
	}

	function handleEdit(item) {
		setForm({ ...item });
		setEditingId(item._id);
	}

	async function handleDelete(id) {
		await fetch(`/api/nav/${id}`, { method: "DELETE" });
		fetchNavItems();
	}

	function handleCancel() {
		setForm(emptyNav);
		setEditingId(null);
	}

	return (
		<div>
			<h2 className="text-xl font-bold mb-4">Navigation Items</h2>
			<form onSubmit={handleSubmit} className="space-y-2 border p-4 rounded mb-6">
				<input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="border p-1 mr-2" required />
				<input name="pageTitle" value={form.pageTitle || ""} onChange={handleChange} placeholder="Page Title" className="border p-1 mr-2" />
				<input name="topic" value={form.topic || ""} onChange={handleChange} placeholder="Topic" className="border p-1 mr-2" />
				<input name="description" value={form.description || ""} onChange={handleChange} placeholder="Description" className="border p-1 mr-2" />
				<input name="image" value={form.image || ""} onChange={handleChange} placeholder="Image URL" className="border p-1 mr-2" />
				<textarea name="content" value={form.content || ""} onChange={handleChange} placeholder="Page Content (HTML allowed)" className="border p-1 mr-2 w-full" rows={3} />
				<label className="inline-flex items-center mr-2">
					<input type="checkbox" name="hasHref" checked={form.hasHref} onChange={handleChange} className="mr-1" />
					Main menu has link
				</label>
				{form.hasHref && (
					<div className="flex flex-col gap-1">
						<input name="href" value={form.href} onChange={handleChange} placeholder="Href" className="border p-1 mr-2" required={form.hasHref} />
						<span className="text-xs text-gray-900">
							For homepage, use <b>/</b> as href.
						</span>
						{hrefError && <span className="text-xs text-red-500">{hrefError}</span>}
					</div>
				)}
				<button type="button" onClick={addDropdownItem} className="bg-blue-200 px-2 py-1 rounded">
					+ Dropdown
				</button>
				{form.dropdownItems.map((item, idx) => (
					<div key={idx} className="flex gap-2 mt-1">
						<input value={item.title} onChange={(e) => handleDropdownChange(idx, "title", e.target.value)} placeholder="Dropdown Title" className="border p-1" required />
						<input value={item.href} onChange={(e) => handleDropdownChange(idx, "href", e.target.value)} placeholder="Dropdown Href" className="border p-1" required />
						<button type="button" onClick={() => removeDropdownItem(idx)} className="text-red-500">
							Remove
						</button>
					</div>
				))}
				<div className="mt-2">
					<button type="submit" className="bg-success text-white px-3 py-1 rounded mr-2">
						{editingId ? "Update" : "Add"}
					</button>
					{editingId && (
						<button type="button" onClick={handleCancel} className="bg-light px-3 py-1 rounded">
							Cancel
						</button>
					)}
				</div>
			</form>
			<ul>
				{navItems.map((item) => (
					<li key={item._id} className="mb-2 border-b pb-2">
						<span className="font-semibold">{item.title}</span> ({item.href})
						{item.dropdownItems && item.dropdownItems.length > 0 && (
							<ul className="ml-4 mt-1">
								{item.dropdownItems.map((d, i) => (
									<li key={i} className="text-sm">
										- {d.title} ({d.href})
									</li>
								))}
							</ul>
						)}
						<button onClick={() => handleEdit(item)} className="text-blue-500 ml-2">
							Edit
						</button>
						<button onClick={() => handleDelete(item._id)} className="text-red-500 ml-2">
							Delete
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
