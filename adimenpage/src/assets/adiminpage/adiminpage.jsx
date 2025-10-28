import React, { useEffect, useState } from "react";
import { supabase } from "./suparbase"; // make sure this file exports supabase client correctly

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    product: "",
    image: "",
    company: "",
    model: "",
    price: "",
    category: "",
    sub_category: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [filtersub_category, setFiltersub_category] = useState("");
  const [subCategories, setSubCategories] = useState([]);

  // ✅ Fetch all unique sub-categories from products
  const fetchSubCategories = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("sub_category")
      .neq("sub_category", null);

    if (error) console.error(error);
    else {
      const uniqueCategories = [
        ...new Set(data.map((item) => item.sub_category)),
      ];
      setSubCategories(uniqueCategories);
    }
  };

  // ✅ Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from("products").select("*").order("id", { ascending: true });
    if (filtersub_category)
      query = query.eq("sub_category", filtersub_category);

    const { data, error } = await query;
    if (error) console.error(error);
    else setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    fetchSubCategories();
  }, [filtersub_category]);

  // ✅ Reset form
  const resetForm = () => {
    setForm({
      product: "",
      image: "",
      company: "",
      model: "",
      price: "",
      category: "",
      sub_category: "",
      description: "",
    });
  };

  // ✅ Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!form.product || !form.price) {
      alert("Please fill in product name and price.");
      return;
    }

    if (editingId) {
      // 🔹 Update existing product
      const { error } = await supabase
        .from("products")
        .update({
          product: form.product,
          image: form.image,
          company: form.company,
          model: form.model,
          price: form.price,
          category: form.category,
          sub_category: form.sub_category,
          description: form.description,
        })
        .eq("id", editingId);

      if (error) {
        console.error("Error updating:", error);
        alert("Failed to update product.");
      } else {
        alert("✅ Product updated successfully!");
        fetchProducts();
        setEditingId(null);
        resetForm();
      }
    } else {
      // 🔹 Insert new product
      const { error } = await supabase.from("products").insert([
        {
          product: form.product,
          image: form.image,
          company: form.company,
          model: form.model,
          price: form.price,
          category: form.category,
          sub_category: form.sub_category,
          description: form.description,
        },
      ]);

      if (error) {
        console.error("Error inserting:", error);
        alert("Failed to add product.");
      } else {
        alert("✅ Product added successfully!");
        fetchProducts();
        resetForm();
      }
    }
  };

  // ✅ Handle edit
  const handleEdit = (product) => {
    setForm({
      product: product.product || "",
      image: product.image || "",
      company: product.company || "",
      model: product.model || "",
      price: product.price || "",
      category: product.category || "",
      sub_category: product.sub_category || "",
      description: product.description || "",
    });
    setEditingId(product.id);
  };

  // ✅ Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) console.error(error);
    else {
      alert("🗑️ Product deleted successfully!");
      fetchProducts();
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>

      {/* Filter */}
      <div style={{ marginBottom: "1rem" }}>
        <select
          value={filtersub_category}
          onChange={(e) => setFiltersub_category(e.target.value)}
        >
          <option value="">All Sub-categories</option>
          {subCategories.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
        <button onClick={fetchProducts} style={{ marginLeft: "1rem" }}>
          Refresh
        </button>
      </div>

      {/* Add / Edit Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: "2rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        {[
          "product",
          "image",
          "company",
          "model",
          "price",
          "category",
          "sub_category",
          "description",
        ].map((field) => (
          <input
            key={field}
            placeholder={field.replace("_", " ")}
            value={form[field]}
            onChange={(e) =>
              setForm({ ...form, [field]: e.target.value })
            }
            style={{ flex: "1 1 200px", padding: "0.5rem" }}
            type={field === "price" ? "number" : "text"}
          />
        ))}
        <button type="submit">
          {editingId ? "Update Product" : "Add Product"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setEditingId(null);
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      {/* Products Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{ width: "100%", textAlign: "left" }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Company</th>
              <th>Model</th>
              <th>Price</th>
              <th>Category</th>
              <th>Sub-category</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.product}</td>
                <td>{p.company}</td>
                <td>{p.model}</td>
                <td>{p.price}</td>
                <td>{p.category}</td>
                <td>{p.sub_category}</td>
                <td>{p.description}</td>
                <td>
                  <button onClick={() => handleEdit(p)}>Edit</button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{ marginLeft: "0.5rem" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPage;
