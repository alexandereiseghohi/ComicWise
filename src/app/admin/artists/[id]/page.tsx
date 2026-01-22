import EditArtistForm from "@/components/admin/edit-artist-form";

export default function Page({ params }: { params: { id: string } }) {
  // Server component: delegate to the server-rendered form (contains a small client uploader)
  return <EditArtistForm id={params.id} />;
}
